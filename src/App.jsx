import { useState, useEffect } from "react"
import { supabase } from "./supabase.js"
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx"
import { BookOpen, Users2, LogOut } from "lucide-react"
import Login from "./pages/Login.jsx"
import BiroPendidikan from "./pages/BiroPendidikan.jsx"
import JadualPegawai from "./pages/JadualPegawai.jsx"
import LaporanBendahari from "./pages/LaporanBendahari.jsx"

function PemilihModul({ onPilih, onLogKeluar }) {
  const { C } = useTheme()
  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDk} 100%)`, padding: "28px 20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
        <img src="/logo-masjid.jpg" alt="Logo" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${C.gold}`, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.gold, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Minbar</div>
          <div style={{ fontSize: 18, fontWeight: "800", color: "white" }}>Masjid Parit Setongkat</div>
        </div>
        <button onClick={onLogKeluar} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "white" }}>
          <LogOut size={20} />
        </button>
      </div>
      <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <button onClick={() => onPilih("biro")} style={{ padding: "20px 16px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primaryLt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={22} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: "800", color: C.txt }}>Biro Pendidikan</div>
            <div style={{ fontSize: 12, color: C.txtMuted, marginTop: 2 }}>Jadual kuliah, penceramah &amp; laporan</div>
          </div>
        </button>
        <button onClick={() => onPilih("pegawai")} style={{ padding: "20px 16px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenLt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users2 size={22} color={C.green} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: "800", color: C.txt }}>Jadual Pegawai</div>
            <div style={{ fontSize: 12, color: C.txtMuted, marginTop: 2 }}>Rotasi Imam &amp; Bilal setiap waktu solat</div>
          </div>
        </button>
      </div>
    </div>
  )
}

function Termuat() {
  const { C } = useTheme()
  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTopColor: C.navy, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  )
}

function AppDalaman() {
  const [session, setSession] = useState(undefined) // undefined = belum semak, null = tiada sesi
  const [bendahariToken] = useState(() => new URLSearchParams(window.location.search).get("bendahari"))
  const [modul, setModul] = useState(null) // null = pemilih | "biro" | "pegawai"

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (bendahariToken) return (
    <LaporanBendahari token={bendahariToken} onAdminLogin={() => {
      window.history.replaceState({}, "", window.location.pathname)
      window.location.reload()
    }} />
  )
  if (session === undefined) return <Termuat />
  if (!session) return <Login />

  if (!modul) return <PemilihModul onPilih={setModul} onLogKeluar={() => supabase.auth.signOut()} />

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      {modul === "biro"
        ? <BiroPendidikan onKembali={() => supabase.auth.signOut()} onTukarModul={() => setModul(null)} />
        : <JadualPegawai onKembali={() => setModul(null)} onLogKeluar={() => supabase.auth.signOut()} />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppDalaman />
    </ThemeProvider>
  )
}

export default App
