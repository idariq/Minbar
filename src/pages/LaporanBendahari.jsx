import { useState, useEffect } from "react"
import { supabase } from "../supabase.js"
import { importSelamat } from "../importSelamat.js"
import { C } from "../constants/theme.js"
import { Download, X } from "lucide-react"

const NAMA_BULAN_SINGKAT = ["","Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogos","Sep","Okt","Nov","Dis"]
const BULAN_SINGKAT_MAP = { Jan:1, Feb:2, Mac:3, Apr:4, Mei:5, Jun:6, Jul:7, Ogos:8, Sep:9, Okt:10, Nov:11, Dis:12 }
const WAKTU_WARNA = { Subuh:"#c7d2fe", Duha:"#fde68a", Jumaat:"#bbf7d0", Maghrib:"#fecaca", Isyak:"#e9d5ff" }
const WAKTU_TEXT  = { Subuh:"#312e81", Duha:"#78350f", Jumaat:"#14532d", Maghrib:"#7f1d1d", Isyak:"#4c1d95" }
const STATUS_WARNA = { Hadir:"#16a34a", Ganti:"#2563eb", Tangguh:"#d97706", "":"#9ca3af" }

function tarikhKeISO(t, bulanYYYYMM) {
  if (!t) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const mat = t.match(/^(\d{1,2})\s+(\w+)/)
  if (mat && bulanYYYYMM) {
    const bln = BULAN_SINGKAT_MAP[mat[2]]
    if (bln) return `${bulanYYYYMM.split("-")[0]}-${String(bln).padStart(2,"0")}-${mat[1].padStart(2,"0")}`
  }
  return ""
}

// Nota: eligibleFlat mesti sudah TIDAK termasuk slot Tangguh + "Tiada Pengganti" (caller kena tapis
// dahulu) — slot itu tak pernah dibayar, jadi tak patut makan bajet langsung. Baki yang tak habis
// dibelanjakan satu agihan terus bawa (cumulative) ke agihan seterusnya dalam bulan yang sama; hanya
// baki selepas agihan TERAKHIR yang jadi "Lebihan" sebenar (dibawa ke bulan depan) — rujuk sisaSelepas.
function hitungAgihanInfo(agihanArr, eligibleFlat, bakiLaluTotal) {
  const permulaan = [], covered = new Set(), kumIsi = [], sisaSelepas = []
  if (!agihanArr.length || !eligibleFlat.length) return { permulaan: agihanArr.map(() => null), covered, kumIsi: agihanArr.map(() => 0), sisaSelepas: agihanArr.map(() => 0) }
  let cursor = 0, carry = bakiLaluTotal
  for (let i = 0; i < agihanArr.length; i++) {
    const budgetMasuk = carry
    const budget = (agihanArr[i].jumlah || 0) + carry
    let kum = 0, lastCovered = cursor - 1
    for (let j = cursor; j < eligibleFlat.length; j++) {
      const cost = (eligibleFlat[j].kadar || 0) + (eligibleFlat[j].sarapan || 0)
      if (kum + cost <= budget) {
        kum += cost; lastCovered = j
        covered.add(eligibleFlat[j].id)
      } else break
    }
    // permulaan = slot pertama yang dibayar oleh wang agihan INI sendiri (bukan baki/carry
    // yang dibawa masuk dari agihan sebelum ini — carry tu menanggung slot-slot awal dahulu)
    if (budgetMasuk > 0) {
      let kumCarry = 0, firstOwnSlot = null
      for (let j = cursor; j <= lastCovered; j++) {
        const cost = (eligibleFlat[j].kadar || 0) + (eligibleFlat[j].sarapan || 0)
        if (kumCarry + cost > budgetMasuk) { firstOwnSlot = eligibleFlat[j]; break }
        kumCarry += cost
      }
      permulaan.push(firstOwnSlot ?? (lastCovered >= cursor ? eligibleFlat[cursor] : null))
    } else {
      permulaan.push(cursor < eligibleFlat.length ? eligibleFlat[cursor] : null)
    }
    kumIsi.push(kum)
    carry = budget - kum
    sisaSelepas.push(carry)
    cursor = lastCovered + 1
  }
  return { permulaan, covered, kumIsi, sisaSelepas }
}

function pecahBaki(bl) {
  bl = bl || {}
  const guna = bl.subuhSet != null || bl.selainSubuhSet != null
  const subuhSlot   = guna ? (bl.subuhSet || 0) : ((bl.sarapan || 0) > 0 ? 1 : 0)
  const selainTotal = guna ? (bl.selainSubuhSet || 0) * 100 : (bl.saguhati || 0)
  const subuhTotal  = guna ? (bl.subuhSet || 0) * 150 : (bl.sarapan || 0)
  return { subuhSlot, selainTotal, subuhTotal, total: selainTotal + subuhTotal }
}

function formatTarikh(t) {
  if (!t) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [, m, d] = t.split("-").map(Number)
    return `${d} ${NAMA_BULAN_SINGKAT[m]}`
  }
  return t
}

export default function LaporanBendahari({ token, onAdminLogin, hideFab = false }) {
  const [status, setStatus] = useState("loading") // loading | valid | invalid
  const [bulanList, setBulanList] = useState([])
  const [bulanAktifId, setBulanAktifId] = useState(null)
  const [bulanLabel, setBulanLabel] = useState("")
  const [data, setData] = useState(null)
  const [muatData, setMuatData] = useState(false)
  const [janaPDF, setJanaPDF] = useState(false)
  const [praState, setPraState] = useState(null)

  useEffect(() => {
    async function init() {
      const { data: result, error } = await supabase.rpc("get_laporan_bendahari", { p_token: token })
      if (error || !result || !Array.isArray(result)) { setStatus("invalid"); return }
      setBulanList(result)
      setStatus("valid")
      if (result.length > 0) setBulanAktifId(result[0].id)
    }
    init()
  }, [token])

  useEffect(() => {
    if (!bulanAktifId || status !== "valid") return
    setMuatData(true)
    setData(null)
    supabase.rpc("get_laporan_bendahari", { p_token: token, p_bulan_id: bulanAktifId })
      .then(({ data: result }) => {
        if (result) { setBulanLabel(result.label || ""); setData(result.data) }
        setMuatData(false)
      })
  }, [bulanAktifId, status])

  const semuaSlot   = (data?.minggu?.flatMap(m => m.slots) || []).filter(s => !s.muslimat && !s.ditangguhJadual)
  const _pb         = pecahBaki(data?.bakiLalu)
  const bakiLaluTotal = data ? _pb.total : 0
  const totalAgihan   = (data?.agihan || []).reduce((a, e) => a + (e.jumlah || 0), 0)
  const totalDibayar  = semuaSlot.reduce((a, s) => s.sebenar ? a + (s.kadar || 0) + (s.sarapan || 0) : a, 0)
  const totalGanjak   = semuaSlot.filter(s => s.status === "Tangguh" && s.kadar > 0 && !s.ditangguhJadual)
                                  .reduce((a, s) => a + s.kadar + (s.sarapan || 0), 0)
  const baki = totalAgihan + bakiLaluTotal - totalDibayar

  async function downloadPDF() {
    if (!data || janaPDF) return
    setJanaPDF(true)
    try {
      const tarCetak = new Date().toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" })
      const bulanYYYYMM = bulanList.find(b => b.id === bulanAktifId)?.bulan || ""
      const slotLaporan = semuaSlot.filter(s => !(s.penceramah || "").includes("Imam Bertugas"))

      // Compute anjakan links locally so PDF reflects tangguh status without requiring "Kira Anjakan Auto"
      const anjakanMap = new Map()
      // slot Tangguh (id) -> slot gantian sebenar (objek) — untuk atribut kos gantian kepada
      // agihan ASAL tangguh tu (bukan agihan yang aktif pada tarikh gantian sebenar berlaku)
      const tangguhGantianSlot = new Map()
      {
        const _pbA = pecahBaki(data.bakiLalu)
        const flatAllA = []
        data.minggu.forEach(m => m.slots.forEach(s => {
          if ((!s.kadar && !s.programRasmi) || s.muslimat || s.ditangguhJadual) return
          flatAllA.push({ s, iso: tarikhKeISO(s.tarikh, bulanYYYYMM) || "z" })
        }))
        flatAllA.sort((a, b) => a.iso.localeCompare(b.iso))
        const _earA = new Set(flatAllA.filter(e => e.s.waktu === "Subuh" && !e.s.programRasmi).slice(0, _pbA.subuhSlot).map(e => e.s.id))
        const flatA = flatAllA.filter(e => !_earA.has(e.s.id))
        let cur = 0
        for (let p = 0; p < (data.agihan||[]).length; p++) {
          const bgt = ((data.agihan||[])[p].jumlah||0) + (p === 0 ? _pbA.selainTotal : 0)
          if (!bgt || cur >= flatA.length) continue
          let kum = 0, idxA = cur - 1
          for (let i = cur; i < flatA.length; i++) {
            if (flatA[i].s.programRasmi) break
            const kos = (flatA[i].s.kadar||0) + (flatA[i].s.sarapan||0)
            if (kum + kos <= bgt) { kum += kos; idxA = i } else break
          }
          if (idxA < cur) continue
          const tgSubuh = [], tgLain = []
          for (let i = cur; i <= idxA; i++) {
            const s = flatA[i].s
            if (s.status !== "Tangguh" || s.ganti !== "Tiada Pengganti") continue
            if (s.waktu === "Subuh") tgSubuh.push(s); else tgLain.push(s)
          }
          let extC = idxA + 1
          for (const ts of tgLain) {
            if (extC >= flatA.length) break
            const cs = flatA[extC].s
            anjakanMap.set(ts.id, { anjakanKe: `${formatTarikh(cs.tarikh)} ${cs.hari} ${cs.waktu}` })
            anjakanMap.set(cs.id, { anjakanDari: `${formatTarikh(ts.tarikh)} ${ts.hari} ${ts.waktu}` })
            tangguhGantianSlot.set(ts.id, cs)
            extC++
          }
          let sCari = idxA + 1
          for (const ts of tgSubuh) {
            for (let j = sCari; j < flatA.length; j++) {
              if (flatA[j].s.waktu === "Subuh") {
                const cs = flatA[j].s
                anjakanMap.set(ts.id, { anjakanKe: `${formatTarikh(cs.tarikh)} ${cs.hari} ${cs.waktu}` })
                anjakanMap.set(cs.id, { anjakanDari: `${formatTarikh(ts.tarikh)} ${ts.hari} ${ts.waktu}` })
                tangguhGantianSlot.set(ts.id, cs)
                sCari = j + 1; break
              }
            }
          }
          cur = extC
          while (cur < flatA.length && flatA[cur].s.programRasmi) cur++
        }
      }

      const saguhatiTotal = slotLaporan.filter(s => s.sebenar).reduce((a, s) => a + (s.kadar || 0), 0)
      const sarapanTotal  = slotLaporan.filter(s => s.sebenar).reduce((a, s) => a + (s.sarapan || 0), 0)

      const eligibleSorted = slotLaporan
        .filter(s => s.kadar > 0 && !s.ditangguhJadual)
        .slice().sort((a, b) => (tarikhKeISO(a.tarikh, bulanYYYYMM)||"").localeCompare(tarikhKeISO(b.tarikh, bulanYYYYMM)||""))
      const pb = pecahBaki(data.bakiLalu)
      const slotLaporanSorted = slotLaporan.slice().sort((a, b) =>
        (tarikhKeISO(a.tarikh, bulanYYYYMM)||"z").localeCompare(tarikhKeISO(b.tarikh, bulanYYYYMM)||"z"))
      const bakiSubuhIds = new Set(
        slotLaporanSorted.filter(s => s.waktu === "Subuh").slice(0, pb.subuhSlot).map(s => s.id)
      )
      // Tangguh + Tiada Pengganti tak pernah dibayar — jangan biar ia makan bajet agihan. Tapi kos
      // gantian sebenar (anjakan) MESTI tetap dibayar — atribut kepada agihan yang aktif pada tarikh
      // tangguh ASAL (bukan tarikh gantian sebenar berlaku), dengan letak "proksi" kos gantian pada
      // kedudukan kronologi slot tangguh tu, dan buang slot gantian dari kedudukan sebenarnya supaya
      // tidak dikira dua kali.
      const gantianIds = new Set([...tangguhGantianSlot.values()].map(g => g.id))
      // proksi (id gantian) -> id tangguh asal — untuk kembalikan label "Agihan bermula"/pemisah
      // jadual ke kedudukan kronologi tangguh yang betul, bukan kedudukan gantian yang lewat
      const proksiIdKeTangguhId = new Map()
      const eligibleForSeq = eligibleSorted
        .filter(s => !bakiSubuhIds.has(s.id) && !gantianIds.has(s.id))
        .map(s => {
          if (s.status !== "Tangguh" || s.ganti !== "Tiada Pengganti") return s
          const gantian = tangguhGantianSlot.get(s.id)
          if (!gantian) return null
          proksiIdKeTangguhId.set(gantian.id, s.id)
          // kedudukan dalam array (untuk atribusi bajet) dah terkunci ikut tarikh tangguh asal —
          // tapi papar tarikh/hari GANTIAN sebenar supaya label "Bermula" bermakna (sesi sebenar)
          return { id: gantian.id, kadar: gantian.kadar, sarapan: gantian.sarapan, waktu: gantian.waktu, tarikh: gantian.tarikh, hari: gantian.hari }
        })
        .filter(Boolean)
      const { permulaan: slotPermulaanPdf, covered: coveredSeq, kumIsi: kumIsiPdf, sisaSelepas: sisaSelepasPdf } = hitungAgihanInfo(data.agihan || [], eligibleForSeq, pb.selainTotal)
      // Baki yang tak habis dibelanjakan satu agihan bawa terus (cumulative) ke agihan seterusnya —
      // jadi hanya baki SELEPAS AGIHAN TERAKHIR yang jadi "Lebihan" sebenar (dibawa ke bulan depan)
      const surplusAgihan = (data.agihan || []).map((_, i) =>
        i === (data.agihan || []).length - 1 ? Math.max(0, sisaSelepasPdf[i] || 0) : 0)
      const getAgihanLabel = (a, idx) => {
        const sp = slotPermulaanPdf[idx]
        return sp ? `${formatTarikh(sp.tarikh)||sp.tarikh} ${sp.hari} ${sp.waktu}` : "—"
      }
      const agihan0Slice = (data.agihan || []).slice(0, 1)
      const { covered: covA0Baki } = agihan0Slice.length ? hitungAgihanInfo(agihan0Slice, eligibleForSeq, pb.selainTotal) : { covered: new Set() }
      const { covered: covA0Base } = agihan0Slice.length ? hitungAgihanInfo(agihan0Slice, eligibleForSeq, 0) : { covered: new Set() }
      const bakiSaguhatiIds = new Set()
      if (pb.selainTotal > 0) {
        for (const s of eligibleForSeq) {
          if (covA0Baki.has(s.id) && !covA0Base.has(s.id)) bakiSaguhatiIds.add(s.id)
        }
        // Jika baki Selain Subuh belum diserap penuh oleh agihan (cth tiada agihan langsung),
        // earmark slot bukan-Subuh terawal supaya baki ditunjuk (+RM, "Dari Baki Bulan Lalu")
        let terpakai = 0
        for (const s of eligibleForSeq) if (bakiSaguhatiIds.has(s.id)) terpakai += (s.kadar||0)+(s.sarapan||0)
        let bakiSelainBaki = pb.selainTotal - terpakai
        for (const s of eligibleForSeq) {
          if (bakiSelainBaki <= 0) break
          if (s.waktu === "Subuh" || coveredSeq.has(s.id) || bakiSaguhatiIds.has(s.id)) continue
          const kos = (s.kadar||0)+(s.sarapan||0)
          if (kos > 0 && kos <= bakiSelainBaki) { bakiSaguhatiIds.add(s.id); bakiSelainBaki -= kos }
          else if (kos > bakiSelainBaki) break
        }
      }
      const coveredIds = new Set(coveredSeq)
      for (const id of bakiSubuhIds) coveredIds.add(id)
      for (const id of bakiSaguhatiIds) coveredIds.add(id)

      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        importSelamat(() => import("jspdf")), importSelamat(() => import("jspdf-autotable"))
      ])
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageW = doc.internal.pageSize.getWidth()
      const mg = 10, cW = pageW - mg * 2
      let y = mg

      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(30, 58, 95)
      doc.text(data.masjid || "Biro Pendidikan", mg, y); y += 4
      doc.setFontSize(8.5); doc.setFont("helvetica", "normal")
      doc.text("Biro Pendidikan — Laporan Sagu Hati Penceramah", mg, y); y += 3
      doc.setFontSize(7.5); doc.setTextColor(107, 114, 128)
      doc.text(`Tempoh: ${bulanLabel}   |   Tarikh Cetak: ${tarCetak}`, mg, y); y += 2
      doc.setDrawColor(30, 58, 95); doc.setLineWidth(0.4)
      doc.line(mg, y, pageW - mg, y); y += 3

      doc.setFillColor(30, 58, 95)
      doc.roundedRect(pageW - mg - 32, mg - 1, 32, 6, 1, 1, "F")
      doc.setFontSize(7); doc.setTextColor(255, 255, 255)
      doc.text("LAPORAN KEWANGAN", pageW - mg - 16, mg + 3.5, { align: "center" })

      doc.setFontSize(7.5); doc.setTextColor(124, 58, 237); doc.setFont("helvetica", "bold")
      doc.text("Baki Anjakan:", mg, y)
      doc.setTextColor(50, 50, 50); doc.setFont("helvetica", "normal")
      doc.text(`${data.bakiLalu?.catatan||"—"}   Selain Subuh: ${data.bakiLalu?.selainSubuhSet||0} slot (RM ${(data.bakiLalu?.selainSubuhSet||0)*100})   Subuh: ${data.bakiLalu?.subuhSet||0} slot (RM ${(data.bakiLalu?.subuhSet||0)*150})   Jumlah: RM ${bakiLaluTotal}`, mg + 22, y); y += 3
      const agihanTeks = !(data.agihan||[]).length ? "Tiada rekod" : (data.agihan||[]).map((a,i) => `${getAgihanLabel(a,i)}: RM ${a.jumlah}`).join("   |   ")
      doc.setFontSize(7.5); doc.setTextColor(30, 58, 95); doc.setFont("helvetica", "bold")
      doc.text("Agihan Bendahari:", mg, y)
      doc.setTextColor(50, 50, 50); doc.setFont("helvetica", "normal")
      doc.text(agihanTeks, mg + 28, y); y += 3

      const cards = [
        ["Baki Lalu", `RM ${bakiLaluTotal}`, [124,58,237]],
        ["Diagihkan", `RM ${totalAgihan}`, [30,58,95]],
        ["Tersedia", `RM ${bakiLaluTotal+totalAgihan}`, [15,118,110]],
        ["Dibayar", `RM ${totalDibayar}`, [22,163,74]],
        ["Anjakan", `RM ${totalGanjak}`, [217,119,6]],
        ["Baki Akhir", `RM ${baki}`, baki >= 0 ? [15,118,110] : [220,38,38]],
      ]
      const cardW = cW / 6
      cards.forEach(([label, value, rgb], i) => {
        const x = mg + i * cardW
        doc.setDrawColor(226,232,240); doc.setFillColor(255,255,255)
        doc.roundedRect(x, y, cardW - 1.5, 8, 1, 1, "FD")
        doc.setFontSize(6.5); doc.setTextColor(107,114,128)
        doc.text(label, x + 2, y + 2.5)
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...rgb)
        doc.text(value, x + 2, y + 6.5)
      }); y += 11

      doc.setFillColor(30,58,95); doc.rect(mg, y, 2, 4.5, "F")
      doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(30,58,95)
      doc.text("Senarai Kuliah Bulanan", mg + 3.5, y + 3.5); y += 5

      const namaPendek = (nama) => {
        if (!nama) return "—"
        return nama.replace(/\s+bin(ti)?\s+.+$/i, "").trim().split(/\s+/).slice(0,4).join(" ")
      }
      const tableRows = slotLaporan.map((s, i) => {
        const _sebenar = s.sebenar && (s.status === "Hadir" || s.status === "Ganti")
        const dibayar = _sebenar ? (s.kadar||0) + (s.sarapan||0) : 0
        const pengRingkas = s.pengisian ? s.pengisian.split(" – ")[0] : "—"
        const _perinciStatus = s.ganti && s.ganti !== "Tiada Pengganti" ? namaPendek(s.ganti)
          : s.status === "Tangguh" ? "Tiada Pengganti"
          : "—"
        const _nota = []
        const _am = anjakanMap.get(s.id) || {}
        if (s.anjakanKe || _am.anjakanKe) _nota.push(`Anjak: ${s.anjakanKe || _am.anjakanKe}`)
        if (s.anjakanDari || _am.anjakanDari) _nota.push(`Dari: ${s.anjakanDari || _am.anjakanDari}`)
        if (bakiSubuhIds.has(s.id)) _nota.push("Dari: Baki Subuh Bulan Lalu")
        if (bakiSaguhatiIds.has(s.id)) _nota.push("Dari: Baki Bulan Lalu")
        return [
          i + 1,
          formatTarikh(s.tarikh) || s.tarikh || "—",
          s.hari || "—",
          s.waktu,
          pengRingkas,
          namaPendek(s.penceramah),
          (s.anjakanDari || anjakanMap.get(s.id)?.anjakanDari) && s.kadar > 0 ? `+RM ${(s.kadar||0)+(s.sarapan||0)}`
            : (bakiSaguhatiIds.has(s.id) || bakiSubuhIds.has(s.id)) && s.kadar > 0 ? `+RM ${(s.kadar||0)+(s.sarapan||0)}`
            : coveredIds.has(s.id) && s.kadar > 0 ? `RM ${(s.kadar||0)+(s.sarapan||0)}` : "—",
          s.status || "—",
          _perinciStatus,
          _sebenar && s.kadar > 0 ? `RM ${s.kadar}` : "—",
          _sebenar && s.sarapan > 0 ? `RM ${s.sarapan}` : "—",
          _nota.join(" / ") || "—",
          dibayar > 0 ? `RM ${dibayar}` : "—",
        ]
      })
      const totalPeruntukan = slotLaporan.reduce((a, s) => coveredIds.has(s.id) && s.kadar > 0 ? a + (s.kadar||0) + (s.sarapan||0) : a, 0)
      const bakiPeruntukan = totalPeruntukan - totalDibayar

      // Insert agihan separator rows
      const slotToPeriIdx = new Map()
      slotPermulaanPdf.forEach((s, idx) => { if (s?.id) slotToPeriIdx.set(proksiIdKeTangguhId.get(s.id) || s.id, idx) })
      const tableRowsWithSep = [], rowSlotMap = new Map()
      let tblR = 0, curGroup = -1
      const akhirGroupIdx = (data.agihan || []).length - 1
      const pushLebihan = (gi) => {
        if (gi < 0 || !(surplusAgihan[gi] > 0)) return
        const akhir = gi === akhirGroupIdx
        tableRowsWithSep.push([{
          content: `Lebihan Agihan ${gi + 1}: RM ${surplusAgihan[gi]}   —   slot bulan ini telah mencukupi${akhir ? ", baki dibawa ke bulan depan" : ""}`,
          colSpan: 13,
          styles: { fillColor: [254,243,199], textColor: [146,64,14], fontStyle: "italic", fontSize: 7, halign: "left", cellPadding: { top: 1, right: 4, bottom: 1, left: 6 } }
        }])
        tblR++
      }
      slotLaporan.forEach((s, sIdx) => {
        const periIdx = slotToPeriIdx.get(s.id)
        if (periIdx !== undefined) {
          pushLebihan(curGroup)
          const ag = (data.agihan || [])[periIdx]
          const sp = slotPermulaanPdf[periIdx]
          const mulaLabel = sp ? `${formatTarikh(sp.tarikh)||sp.tarikh} ${sp.hari} ${sp.waktu}` : ""
          tableRowsWithSep.push([{
            content: `Agihan ${periIdx + 1}   RM ${ag?.jumlah || 0}${mulaLabel ? `   |   bermula: ${mulaLabel}` : ""}`,
            colSpan: 13,
            styles: { fillColor: [226,232,240], textColor: [30,58,95], fontStyle: "bold", fontSize: 7, halign: "left", cellPadding: { top: 1, right: 4, bottom: 1, left: 6 } }
          }])
          tblR++
          curGroup = periIdx
        }
        rowSlotMap.set(tblR, sIdx)
        tableRowsWithSep.push(tableRows[sIdx])
        tblR++
      })
      pushLebihan(curGroup)

      autoTable(doc, {
        startY: y, margin: { left: mg, right: mg },
        head: [["Bil.", "Tarikh", "Hari", "Waktu", "Pengisian", "Penceramah", "Peruntukan", "Status", "Perincian Status", "Sagu Hati", "Sarapan", "Nota", "Jumlah"]],
        body: tableRowsWithSep,
        foot: [
          ["","","","","","JUMLAH KESELURUHAN", `RM ${totalPeruntukan}`,"","",`RM ${saguhatiTotal}`,`RM ${sarapanTotal}`,"",`RM ${totalDibayar}`],
          ["","","","","","BAKI (Peruntukan - Sebenar)", `RM ${bakiPeruntukan}`,"","","","","",""],
        ],
        showFoot: "lastPage",
        styles: { fontSize: 8, cellPadding: 1.5, font: "helvetica" },
        headStyles: { fillColor: [30,58,95], textColor: [255,255,255], fontStyle: "bold", fontSize: 8 },
        footStyles: { fillColor: [239,246,255], textColor: [30,58,95], fontStyle: "bold", fontSize: 8 },
        alternateRowStyles: { fillColor: [248,250,252] },
        columnStyles: {
          0: { halign:"center", cellWidth:8 }, 1: { cellWidth:14 }, 2: { cellWidth:12 },
          3: { cellWidth:16 }, 4: { cellWidth:26 }, 5: { cellWidth:43 },
          6: { halign:"right", cellWidth:20 }, 7: { cellWidth:16 }, 8: { cellWidth:32 },
          9: { halign:"right", cellWidth:18 }, 10: { halign:"right", cellWidth:15 },
          11: { cellWidth:39 }, 12: { halign:"right", cellWidth:18 },
        },
        didParseCell: (d) => {
          if (d.column.index === 3 && d.section === "body") {
            const bg = { Subuh:[238,242,255], Duha:[255,251,235], Jumaat:[240,253,244], Maghrib:[255,241,242], Isyak:[250,245,255] }[d.cell.raw]
            const txt = { Subuh:[55,48,163], Duha:[146,64,14], Jumaat:[20,83,45], Maghrib:[159,18,57], Isyak:[91,33,182] }[d.cell.raw]
            if (bg) { d.cell.styles.fillColor = bg; d.cell.styles.textColor = txt; d.cell.styles.fontStyle = "bold" }
          }
          if (d.column.index === 7 && d.section === "body") {
            const c = { Hadir:[22,163,74], Ganti:[37,99,235], Tangguh:[217,119,6] }[d.cell.raw]
            if (c) { d.cell.styles.textColor = c; d.cell.styles.fontStyle = "bold" }
          }
          if (d.column.index === 12 && d.section === "body" && d.cell.raw !== "—") {
            d.cell.styles.textColor = [22,163,74]; d.cell.styles.fontStyle = "bold"
          }
          if (d.column.index === 6 && d.section === "body" && d.cell.raw !== "—") {
            const slotIdx = rowSlotMap.get(d.row.index)
            if (slotIdx === undefined) return
            const slot = slotLaporan[slotIdx]
            const _amP = anjakanMap.get(slot?.id) || {}
            if (slot?.anjakanKe || _amP.anjakanKe) { d.cell.styles.textColor = [160,160,160]; d.cell.styles.fontStyle = "italic" }
            else if (slot?.anjakanDari || _amP.anjakanDari) { d.cell.styles.textColor = [146,64,14]; d.cell.styles.fontStyle = "normal" }
            else if (bakiSaguhatiIds.has(slot?.id) || bakiSubuhIds.has(slot?.id)) { d.cell.styles.textColor = [109,40,217]; d.cell.styles.fontStyle = "normal" }
            else if (coveredIds.has(slot?.id)) { d.cell.styles.textColor = [30,58,95]; d.cell.styles.fontStyle = "normal" }
          }
          if (d.section === "foot" && [6,9,10,12].includes(d.column.index)) d.cell.styles.halign = "right"
        },
        didDrawCell: (d) => {
          if (d.column.index === 6 && d.section === "body" && d.cell.raw !== "—") {
            const slotIdx = rowSlotMap.get(d.row.index)
            if (slotIdx === undefined) return
            const slot = slotLaporan[slotIdx]
            const _amD = anjakanMap.get(slot?.id) || {}
            if (slot?.anjakanKe || _amD.anjakanKe) {
              const fsPt = d.cell.styles.fontSize || 8
              const padR = d.cell.padding?.right ?? 1.5
              doc.setFont("helvetica", "normal"); doc.setFontSize(fsPt)
              const tw = doc.getTextWidth(String(d.cell.raw))
              const xR = d.cell.x + d.cell.width - padR
              const xL = xR - tw
              const lineY = d.cell.textPos
                ? d.cell.textPos.y - fsPt * 0.352 * 0.35
                : d.cell.y + (d.cell.padding?.top ?? 1.5) + fsPt * 0.352 * 0.5
              doc.setDrawColor(160,160,160); doc.setLineWidth(0.3)
              doc.line(xL, lineY, xR, lineY)
            }
          }
        },
      })
      const namaFail = `Laporan_Sagu_Hati_${(bulanLabel||"Kewangan").replace(/\s+/g,"_")}.pdf`
      const blobUrl = URL.createObjectURL(doc.output("blob"))
      try {
        const pageImgs = await renderPdfKeImej(doc.output("arraybuffer"))
        setPraState({ url: blobUrl, namaFail, pages: pageImgs })
      } catch (e) {
        // PDF sedia (blobUrl) — cuma pratonton imej gagal. Kekalkan modal
        // dengan butang "Muat Turun" berfungsi, bukan senyap terus gagal.
        console.error("Gagal papar pratonton (dokumen tetap sedia untuk muat turun):", e)
        setPraState({ url: blobUrl, namaFail, pages: null, ralatPratonton: true })
      }
    } catch (e) {
      console.error("Gagal jana PDF:", e)
      alert("Gagal jana laporan PDF: " + (e?.message || "ralat tidak diketahui"))
    }
    finally { setJanaPDF(false) }
  }

  async function renderPdfKeImej(arrayBuffer) {
    const pdfjs = await importSelamat(() => import("pdfjs-dist"))
    const workerUrl = (await importSelamat(() => import("pdfjs-dist/build/pdf.worker.min.mjs?url"))).default
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    const imgs = []
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement("canvas")
      canvas.width = viewport.width; canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise
      imgs.push(canvas.toDataURL("image/jpeg", 0.9))
    }
    return imgs
  }

  if (status === "loading") return (
    <div style={{ minHeight:"100svh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:13, color:C.txtMuted }}>Mengesahkan akses...</div>
    </div>
  )

  if (status === "invalid") return (
    <div style={{ minHeight:"100svh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <div style={{ fontSize:15, fontWeight:"700", color:C.txt, marginBottom:8 }}>Akses Tidak Sah</div>
        <div style={{ fontSize:13, color:C.txtMuted, marginBottom:20 }}>Link laporan ini tidak sah atau telah tamat tempoh.</div>
        <button onClick={onAdminLogin} style={{ padding:"9px 20px", borderRadius:8, border:"none", background:"#1e3a5f", color:"white", cursor:"pointer", fontSize:13, fontWeight:"600" }}>
          Log Masuk Admin
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ background:C.bg, minHeight:"100svh", maxWidth:520, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0f1f35,#1e3a5f)", padding:"14px 16px 12px", borderBottom:"3px solid #c9a227" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
          <img src="/logo-masjid.jpg" alt="" style={{ width:40, height:40, objectFit:"contain", borderRadius:"50%", border:"2px solid #c9a227", background:"white", padding:2, boxSizing:"border-box" }} onError={e => e.target.style.display="none"} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:"#c9a227", fontWeight:"700", letterSpacing:0.5 }}>LAPORAN KEWANGAN</div>
            <div style={{ fontSize:14, color:"white", fontWeight:"700" }}>{data?.masjid || "Biro Pendidikan"}</div>
            <div style={{ fontSize:11, color:"rgba(201,162,39,0.8)" }}>Biro Pendidikan dan Dakwah</div>
          </div>
        </div>
        <select
          value={bulanAktifId || ""}
          onChange={e => setBulanAktifId(e.target.value)}
          style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1.5px solid #c9a227", background:"rgba(255,255,255,0.08)", color:"white", fontSize:13, fontWeight:"600", cursor:"pointer" }}
        >
          {bulanList.map(b => <option key={b.id} value={b.id} style={{ background:"#1e3a5f" }}>{b.label}</option>)}
        </select>
      </div>

      <div style={{ padding:"14px 14px 60px" }}>
        {muatData && (
          <div style={{ textAlign:"center", padding:40, color:C.txtMuted, fontSize:13 }}>Memuatkan...</div>
        )}

        {!muatData && data && (
          <>
            {/* Kad ringkasan */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7, marginBottom:14 }}>
              {[
                ["Baki Lalu",  `RM ${bakiLaluTotal}`,             "#7c3aed"],
                ["Diagihkan",  `RM ${totalAgihan}`,                "#1e3a5f"],
                ["Tersedia",   `RM ${bakiLaluTotal + totalAgihan}`,"#0f766e"],
                ["Dibayar",    `RM ${totalDibayar}`,               "#16a34a"],
                ["Anjakan",    `RM ${totalGanjak}`,                "#d97706"],
                ["Baki Akhir", `RM ${baki}`,                       baki >= 0 ? "#0f766e" : "#dc2626"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background:C.card, border:`1.5px solid ${c}20`, borderRadius:9, padding:"7px 9px" }}>
                  <div style={{ fontSize:9, color:C.txtMuted, fontWeight:"600", marginBottom:1 }}>{l}</div>
                  <div style={{ fontSize:13, fontWeight:"700", color:c }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Baki Anjakan Bulan Lalu */}
            <div style={{ background:"#f3e8ff", border:"1.5px solid #a855f7", borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
              <div style={{ fontWeight:"700", color:"#7c3aed", fontSize:12, marginBottom:8 }}>Baki Anjakan Bulan Lalu</div>
              {data.bakiLalu?.catatan && (
                <div style={{ fontSize:11, color:"#6d28d9", marginBottom:8, fontStyle:"italic" }}>{data.bakiLalu.catatan}</div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:11, color:"#6d28d9" }}>Subuh ({_pb.subuhSlot} slot × RM150)</span>
                <span style={{ fontSize:11, fontWeight:"700", color:"#7c3aed" }}>RM {_pb.subuhTotal}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:11, color:"#6d28d9" }}>Selain Subuh ({data.bakiLalu?.selainSubuhSet || 0} slot × RM100)</span>
                <span style={{ fontSize:11, fontWeight:"700", color:"#7c3aed" }}>RM {_pb.selainTotal}</span>
              </div>
              <div style={{ borderTop:"1px solid #a855f740", paddingTop:7, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:"#7c3aed", fontWeight:"600" }}>Jumlah Baki</span>
                <span style={{ fontSize:14, fontWeight:"800", color:"#6d28d9" }}>RM {bakiLaluTotal}</span>
              </div>
            </div>

            {/* Agihan Bendahari */}
            <div style={{ background:C.card, border:"1.5px solid #1e3a5f30", borderRadius:10, padding:"10px 12px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontWeight:"700", color:"#1e3a5f", fontSize:12 }}>Agihan Bendahari</div>
                <div style={{ fontSize:13, fontWeight:"800", color:"#1e3a5f" }}>RM {totalAgihan}</div>
              </div>
              {!(data.agihan || []).length ? (
                <div style={{ fontSize:11, color:C.txtMuted, fontStyle:"italic" }}>Tiada agihan direkodkan</div>
              ) : (data.agihan || []).map((a, i) => (
                <div key={a.id || i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom: i < data.agihan.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize:11, color:C.txtMuted }}>Agihan {i + 1}</span>
                  <span style={{ fontSize:12, fontWeight:"700", color:"#1e3a5f" }}>RM {a.jumlah || 0}</span>
                </div>
              ))}
            </div>

            {/* Senarai slot per minggu */}
            {data.minggu.map((minggu, mIdx) => {
              const slotTersaring = minggu.slots.filter(s => !s.muslimat && !s.ditangguhJadual)
              if (!slotTersaring.length) return null
              const dibayarMinggu = slotTersaring.reduce((a, s) => s.sebenar ? a + (s.kadar || 0) + (s.sarapan || 0) : a, 0)
              return (
                <div key={minggu.id || mIdx} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, marginBottom:12, overflow:"hidden" }}>
                  <div style={{ background:"#1e3a5f", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px" }}>
                    <div style={{ color:"white", fontWeight:"700", fontSize:13 }}>Minggu {mIdx + 1}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)" }}>Dibayar: RM {dibayarMinggu}</div>
                  </div>
                  <div style={{ padding:"8px 10px 4px" }}>
                    {slotTersaring.map((slot, sIdx) => {
                      const dibayar = slot.sebenar ? (slot.kadar || 0) + (slot.sarapan || 0) : 0
                      return (
                        <div key={slot.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom: sIdx < slotTersaring.length - 1 ? `1px solid ${C.border}` : "none" }}>
                          <div style={{ minWidth:38, flexShrink:0 }}>
                            <div style={{ fontSize:11, fontWeight:"700", color:"#1e3a5f" }}>{formatTarikh(slot.tarikh) || "—"}</div>
                            <div style={{ fontSize:9, color:C.txtMuted }}>{slot.hari}</div>
                          </div>
                          <span style={{ fontSize:10, fontWeight:"600", padding:"1px 5px", borderRadius:4, background:WAKTU_WARNA[slot.waktu]||"#f1f5f9", color:WAKTU_TEXT[slot.waktu]||"#374151", whiteSpace:"nowrap", flexShrink:0 }}>{slot.waktu}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11, color:C.txt, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{slot.penceramah || "—"}</div>
                            {slot.anjakanDari && <div style={{ fontSize:9, color:"#d97706" }}>Anjakan dari: {slot.anjakanDari}</div>}
                            {slot.anjakanKe   && <div style={{ fontSize:9, color:"#d97706" }}>Anjakan ke: {slot.anjakanKe}</div>}
                          </div>
                          {slot.status && <span style={{ fontSize:10, fontWeight:"600", color:STATUS_WARNA[slot.status]||C.txtMuted, whiteSpace:"nowrap", flexShrink:0 }}>{slot.status}</span>}
                          <div style={{ fontSize:11, fontWeight:"700", color:dibayar > 0 ? "#16a34a" : C.txtMuted, minWidth:40, textAlign:"right", flexShrink:0 }}>
                            {dibayar > 0 ? `RM${dibayar}` : "—"}
                          </div>
                        </div>
                      )
                    })}
                    <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 4px 2px", marginTop:4, borderTop:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:11, color:"#1e3a5f" }}>Jumlah minggu ini:</span>
                      <span style={{ fontSize:11, fontWeight:"700", color:"#16a34a" }}>RM {dibayarMinggu}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Footer jumlah */}
            <div style={{ background:"#1e3a5f", borderRadius:10, padding:"14px", textAlign:"center", marginTop:4 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", marginBottom:4 }}>Jumlah Dibayar — {bulanLabel}</div>
              <div style={{ fontSize:24, fontWeight:"800", color:"white" }}>RM {totalDibayar}</div>
              <div style={{ marginTop:8, fontSize:12, color: baki >= 0 ? "#86efac" : "#fca5a5", fontWeight:"600" }}>
                Baki Akhir: RM {baki}
              </div>
            </div>
          </>
        )}
      </div>

      {data && !hideFab && (
        <button
          onClick={downloadPDF}
          disabled={janaPDF}
          style={{
            position: "fixed", bottom: 24, right: 20, zIndex: 100,
            background: janaPDF ? "#94a3b8" : "#1e3a5f",
            color: "white", border: "none", borderRadius: 28,
            padding: "13px 20px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(30,58,95,0.4)",
            cursor: janaPDF ? "wait" : "pointer",
            fontSize: 13, fontWeight: "700", transition: "background 0.2s",
          }}
        >
          <Download size={18} />
          {janaPDF ? "Menjana..." : "Pratonton PDF"}
        </button>
      )}

      {praState && (
        <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#1e3a5f", flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: "700", color: "white" }}>Pratonton Laporan PDF</span>
            <button onClick={() => { URL.revokeObjectURL(praState.url); setPraState(null) }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={20} color="white" />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: "#94a3b8", padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {praState.ralatPratonton ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 13, color: "white", fontWeight: "600", marginBottom: 4 }}>Pratonton tak dapat dipaparkan.</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Dokumen dah sedia — guna butang "Muat Turun" di bawah.</div>
              </div>
            ) : (praState.pages || []).map((src, i) => (
              <img key={i} src={src} alt={`Halaman ${i + 1}`} style={{ width: "100%", maxWidth: 900, borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.4)", display: "block" }} />
            ))}
          </div>
          <div style={{ padding: "12px 16px", background: "#1e3a5f", display: "flex", gap: 10, flexShrink: 0 }}>
            <button onClick={() => { URL.revokeObjectURL(praState.url); setPraState(null) }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "600" }}>
              Tutup
            </button>
            <button onClick={() => { const a = document.createElement("a"); a.href = praState.url; a.download = praState.namaFail; a.click() }} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "#16a34a", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={16} /> Muat Turun
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
