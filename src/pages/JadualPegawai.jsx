import { useState, useEffect } from "react"
import { supabase } from "../supabase.js"
import { useTheme } from "../context/ThemeContext.jsx"
import {
  ArrowLeft, Calendar, Plus, MoreVertical, Trash2,
  ChevronDown, ChevronRight, LogOut, Check
} from "lucide-react"

const WAKTU_LIST = ["Subuh", "Zohor", "Asar", "Maghrib", "Isyak"]
const NAMA_BULAN = ["", "Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"]

function labelDariBulan(yyyymm) {
  if (!yyyymm) return ""
  const [tahun, bulan] = yyyymm.split("-").map(Number)
  return `${NAMA_BULAN[bulan]} ${tahun}`
}

function mingguKosong(n) {
  return { id: crypto.randomUUID(), label: `Minggu ${n}`, slots: [] }
}

// Setiap bulan jadual pegawai dibuat unik (bukan ikut templat berulang) — jadi
// bulan baharu sentiasa mula sebagai grid kosong (semua hari x waktu ada slot,
// tapi Imam/Bilal kosong) untuk admin isi terus.
function dataKosongPegawai(yyyymm) {
  const [tahun, bulan] = yyyymm.split("-").map(Number)
  const jumlahHari = new Date(tahun, bulan, 0).getDate()
  const HARI_NAMA = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"]
  const jumlahMinggu = jumlahHari > 28 ? 5 : 4
  const minggu = Array.from({ length: jumlahMinggu }, (_, i) => mingguKosong(i + 1))

  for (let h = 1; h <= jumlahHari; h++) {
    const dow = new Date(tahun, bulan - 1, h).getDay()
    const idx = Math.min(Math.ceil(h / 7) - 1, jumlahMinggu - 1)
    for (const waktu of WAKTU_LIST) {
      minggu[idx].slots.push({
        id: crypto.randomUUID(),
        tarikh: `${tahun}-${String(bulan).padStart(2, "0")}-${String(h).padStart(2, "0")}`,
        hari: HARI_NAMA[dow],
        waktu,
        imam: "",
        bilal: "",
      })
    }
  }
  return { minggu: minggu.filter(m => m.slots.length > 0) }
}

function formatTarikhPenuh(iso, hari) {
  if (!iso) return hari || ""
  const [tahun, bulan, hariNum] = iso.split("-").map(Number)
  return `${hari}, ${hariNum} ${NAMA_BULAN[bulan]} ${tahun}`
}

export default function JadualPegawai({ onKembali, onLogKeluar }) {
  const { C } = useTheme()
  const [view, setView] = useState("senarai") // senarai | bulan
  const [bulanList, setBulanList] = useState([])
  const [bulanAktif, setBulanAktif] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simpanLoading, setSimpanLoading] = useState(false)
  const [adaUbah, setAdaUbah] = useState(false)
  const [mingguBuka, setMingguBuka] = useState({})
  const [expandSlot, setExpandSlot] = useState(null)
  const [modalBulanBaru, setModalBulanBaru] = useState(false)
  const [formBulan, setFormBulan] = useState({ bulan: "" })
  const [menuBulan, setMenuBulan] = useState(null)
  const [konfirmasiPadam, setKonfirmasiPadam] = useState(null)
  const [pegawaiList, setPegawaiList] = useState([])

  useEffect(() => { muatSemua() }, [])

  async function muatSemua() {
    setLoading(true)
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from("pegawai_bulan").select("id,bulan,label,dikemas_pada").order("bulan", { ascending: false }),
      supabase.from("pegawai_senarai").select("*").order("nama"),
    ])
    setBulanList(b || [])
    setPegawaiList(p || [])
    setLoading(false)
  }

  async function bukaBulan(rekod) {
    setLoading(true)
    const { data: d } = await supabase.from("pegawai_bulan").select("*").eq("id", rekod.id).single()
    setBulanAktif(d)
    setData(d.data)
    setAdaUbah(false)
    setMingguBuka({ 0: true })
    setView("bulan")
    setLoading(false)
  }

  async function buatBulanBaru() {
    if (!formBulan.bulan) return
    setSimpanLoading(true)
    const newData = dataKosongPegawai(formBulan.bulan)
    const { data: baru, error } = await supabase.from("pegawai_bulan")
      .insert({ bulan: formBulan.bulan, label: labelDariBulan(formBulan.bulan), data: newData })
      .select().single()
    setSimpanLoading(false)
    if (!error) {
      setModalBulanBaru(false)
      setFormBulan({ bulan: "" })
      await muatSemua()
      if (baru) bukaBulan(baru)
    }
  }

  async function padamBulan(id) {
    await supabase.from("pegawai_bulan").delete().eq("id", id)
    setKonfirmasiPadam(null)
    await muatSemua()
  }

  function kemas(fn) {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      fn(next)
      return next
    })
    setAdaUbah(true)
  }

  function kemasSlot(mIdx, id, field, val) {
    kemas(d => { const s = d.minggu[mIdx].slots.find(s => s.id === id); if (s) s[field] = val })
  }

  async function simpan() {
    if (!bulanAktif || simpanLoading) return
    setSimpanLoading(true)
    await supabase.from("pegawai_bulan").update({ data, dikemas_pada: new Date().toISOString() }).eq("id", bulanAktif.id)
    setSimpanLoading(false)
    setAdaUbah(false)
  }

  const namaCadangan = Array.from(new Set(pegawaiList.map(p => p.nama).filter(Boolean)))

  const inp = { padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, background: C.card, color: C.txt, width: "100%", boxSizing: "border-box" }
  const navbarStyle = {
    background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDk} 100%)`,
    borderBottom: `2.5px solid ${C.gold}`,
    padding: "0 8px 0 4px",
    height: 56,
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  }

  // ── LOADING ──
  if (loading) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={navbarStyle}>
        <button onClick={onKembali} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, fontWeight: "700", fontSize: 16, color: "white" }}>Jadual Pegawai</div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.navy}30`, borderTopColor: C.navy, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  // ── SENARAI BULAN ──
  if (view === "senarai") return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
      <div style={navbarStyle}>
        <button onClick={onKembali} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, padding: "0 6px" }}>
          <div style={{ fontWeight: "700", fontSize: 16, color: "white" }}>Jadual Pegawai</div>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 0.5 }}>Masjid Parit Setongkat</div>
        </div>
        {onLogKeluar && (
          <button onClick={() => { if (window.confirm("Log keluar daripada Minbar?")) onLogKeluar() }} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
            <LogOut size={20} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: "700", color: C.txtMuted, textTransform: "uppercase", letterSpacing: 1 }}>Rekod Jadual</div>
          <button onClick={() => setModalBulanBaru(true)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: C.navy, color: "white", cursor: "pointer", fontSize: 11, fontWeight: "700", display: "flex", alignItems: "center", gap: 4 }}>
            <Plus size={13} /> Bulan Baru
          </button>
        </div>

        {bulanList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.txtMuted, background: C.card, borderRadius: 14, border: `1px solid ${C.border}` }}>
            <Calendar size={36} color={C.border} style={{ display: "block", margin: "0 auto 10px" }} />
            <div style={{ fontWeight: "600", fontSize: 13, marginBottom: 4 }}>Tiada rekod bulan</div>
            <div style={{ fontSize: 12 }}>Tekan "Bulan Baru" untuk mulakan</div>
          </div>
        ) : <>
          {menuBulan && <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuBulan(null)} />}
          {bulanList.map(b => (
            <div key={b.id} style={{ position: "relative", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${C.navy}, ${C.navyDk})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Calendar size={18} color="white" />
              </div>
              <div style={{ flex: 1, cursor: "pointer", minWidth: 0 }} onClick={() => bukaBulan(b)}>
                <div style={{ fontWeight: "700", fontSize: 14, color: C.txt }}>{b.label}</div>
                <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>Dikemas: {new Date(b.dikemas_pada).toLocaleDateString("ms-MY")}</div>
              </div>
              <button onClick={() => bukaBulan(b)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: C.navy, color: "white", cursor: "pointer", fontSize: 12, fontWeight: "600", flexShrink: 0 }}>Buka</button>
              <button onClick={e => { e.stopPropagation(); setMenuBulan(menuBulan === b.id ? null : b.id) }} style={{ padding: "6px", background: "none", border: "none", cursor: "pointer", color: C.txtMuted, display: "flex", alignItems: "center", flexShrink: 0 }}>
                <MoreVertical size={16} />
              </button>
              {menuBulan === b.id && (
                <div style={{ position: "absolute", right: 8, top: 52, zIndex: 100, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", minWidth: 160, overflow: "hidden" }}>
                  <button onClick={() => { setKonfirmasiPadam(b); setMenuBulan(null) }} style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.danger, display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                    <Trash2 size={13} /> Padam bulan ini
                  </button>
                </div>
              )}
            </div>
          ))}
        </>}
      </div>

      {modalBulanBaru && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 24, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontWeight: "800", fontSize: 16, color: C.txt, marginBottom: 16 }}>Bulan Baru</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.txtMuted, marginBottom: 5 }}>Pilih Bulan</div>
              <input type="month" value={formBulan.bulan} onChange={e => setFormBulan(p => ({ ...p, bulan: e.target.value }))} style={inp} />
              {formBulan.bulan && <div style={{ fontSize: 11, color: C.primary, marginTop: 4, fontWeight: "600" }}>{labelDariBulan(formBulan.bulan)}</div>}
            </div>
            <div style={{ fontSize: 11, color: C.txtMuted, marginBottom: 18, lineHeight: 1.5 }}>
              Jadual bermula kosong (semua hari &amp; waktu solat disediakan) — isi Imam &amp; Bilal untuk setiap slot ikut rotasi bulan ini.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setModalBulanBaru(false)} style={{ flex: 1, padding: "10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "none", color: C.txt, cursor: "pointer", fontSize: 13, fontWeight: "600" }}>Batal</button>
              <button onClick={buatBulanBaru} disabled={!formBulan.bulan || simpanLoading} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: C.navy, color: "white", cursor: formBulan.bulan ? "pointer" : "not-allowed", opacity: formBulan.bulan ? 1 : 0.5, fontSize: 13, fontWeight: "700" }}>
                {simpanLoading ? "Menjana..." : "Buat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {konfirmasiPadam && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 22, width: "100%", maxWidth: 340 }}>
            <div style={{ fontWeight: "800", fontSize: 15, color: C.txt, marginBottom: 8 }}>Padam "{konfirmasiPadam.label}"?</div>
            <div style={{ fontSize: 12, color: C.txtMuted, marginBottom: 18 }}>Tindakan ini tidak boleh dibatalkan.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setKonfirmasiPadam(null)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1px solid ${C.border}`, background: "none", color: C.txt, cursor: "pointer", fontSize: 13, fontWeight: "600" }}>Batal</button>
              <button onClick={() => padamBulan(konfirmasiPadam.id)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: C.danger, color: "white", cursor: "pointer", fontSize: 13, fontWeight: "700" }}>Padam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── BULAN (jadual mingguan) ──
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
      <div style={navbarStyle}>
        <button onClick={() => { if (adaUbah && !window.confirm("Ada perubahan belum disimpan. Tutup tanpa simpan?")) return; setView("senarai") }} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: 15, color: "white" }}>{bulanAktif?.label}</div>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 0.5 }}>Jadual Pegawai</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: "600", paddingRight: 8, color: simpanLoading ? C.gold : adaUbah ? C.gold : C.green }}>
          {simpanLoading ? "Menyimpan..." : adaUbah ? "● Belum simpan" : "✓ Tersimpan"}
        </div>
      </div>

      <datalist id="pegawai-nama-cadangan">{namaCadangan.map(n => <option key={n} value={n} />)}</datalist>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 88px" }}>
        {data.minggu.map((minggu, mIdx) => {
          const buka = !!mingguBuka[mIdx]
          const terisi = minggu.slots.filter(s => s.imam || s.bilal).length
          return (
            <div key={minggu.id || mIdx} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ background: C.navy, display: "flex", alignItems: "center", padding: "8px 12px", gap: 8, cursor: "pointer" }} onClick={() => setMingguBuka(p => ({ ...p, [mIdx]: !buka }))}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontWeight: "700", fontSize: 13 }}>{minggu.label}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{terisi}/{minggu.slots.length} slot diisi</div>
                </div>
                {buka ? <ChevronDown size={16} color="white" /> : <ChevronRight size={16} color="white" />}
              </div>
              {buka && minggu.slots.map(slot => {
                const isExp = expandSlot === slot.id
                const kosong = !slot.imam && !slot.bilal
                return (
                  <div key={slot.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <div onClick={() => setExpandSlot(isExp ? null : slot.id)} style={{ padding: "10px 12px", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 12, fontWeight: "700", color: C.txt }}>{formatTarikhPenuh(slot.tarikh, slot.hari)}</div>
                        <div style={{ fontSize: 10, fontWeight: "700", color: C.navy, background: C.primaryLt, padding: "2px 8px", borderRadius: 6 }}>{slot.waktu}</div>
                      </div>
                      <div style={{ fontSize: 12, color: kosong ? C.txtMuted : C.txt, marginTop: 4, display: "flex", gap: 14, fontStyle: kosong ? "italic" : "normal" }}>
                        {kosong ? "Belum diisi" : <>
                          <span>Imam: <b>{slot.imam || "—"}</b></span>
                          <span>Bilal: <b>{slot.bilal || "—"}</b></span>
                        </>}
                      </div>
                    </div>
                    {isExp && (
                      <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Imam</div>
                            <input value={slot.imam} onChange={e => kemasSlot(mIdx, slot.id, "imam", e.target.value)} list="pegawai-nama-cadangan" style={inp} />
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Bilal</div>
                            <input value={slot.bilal} onChange={e => kemasSlot(mIdx, slot.id, "bilal", e.target.value)} list="pegawai-nama-cadangan" style={inp} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {buka && minggu.slots.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", color: C.txtMuted, fontSize: 12 }}>Tiada slot minggu ini</div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 12px", background: C.card, borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <button onClick={simpan} disabled={!adaUbah || simpanLoading} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: adaUbah ? C.navy : C.border, color: "white", cursor: adaUbah ? "pointer" : "not-allowed", fontSize: 14, fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Check size={16} /> {simpanLoading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  )
}
