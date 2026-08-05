import { useState, useEffect, useRef } from "react"
import { supabase, EMEL_AKAUN } from "../supabase.js"
import { importSelamat } from "../importSelamat.js"
import { useTheme } from "../context/ThemeContext.jsx"
import {
  ChevronDown, ChevronRight, Printer, Plus, Trash2,
  Users, Calendar, X, Check, MoreVertical, Download,
  BookOpen, ArrowLeft, Zap, FileText, Wallet, Star,
  LayoutList, RotateCcw, Upload, LogOut, Eye, EyeOff, Settings
} from "lucide-react"
import LaporanBendahari from "./LaporanBendahari.jsx"

const PENCERAMAH_SEDIA_ADA = [
  "Ustaz Khairul Syah bin Ahmad",
  "Ustaz Masiat bin Abd Hamid",
  "Ustaz Norhakim bin Rafique",
  "Ustazah Zabediah binti Othman",
  "Ustaz Iskandar bin Hamzah",
  "Ustaz Hj. Ishak bin Nor",
  "Ustaz Hj. Mohamad bin Abdullah",
  "Ustaz Mohd Hafizi bin Abd Samat",
  "Ustaz Hj. Tajuddin bin Abd Halim",
  "Ustaz Omar bin Abu Bakar",
  "Ustaz Hj. Ilham bin Imam",
  "Ustazah Hajah Maryamah binti Kamijan",
  "Ustaz Hafizul Izani bin Lufti Amir",
  "Ustaz Jamingan bin Sukran",
  "Ustaz Fadhil bin Muhammad Amin",
  "Ustaz Hj. Paruddin bin Md. Naroh",
  "Ustaz Aiman bin Muhammad",
  "Ustaz Jumat bin Jamil",
  "Ustaz Nor Sakini bin Pasikah",
  "Ustaz Che Nur Azizi Aizuddin bin Che Abd Kadir",
  "Ustaz Norhisham bin Jaliman",
  "Ustaz Ahmad Faiz bin Abd Rashid",
  "Ustaz Lutfi bin Abdul Latif",
  "Penceramah Jemputan",
]

const PENGISIAN_SEDIA_ADA = [
  "Pengajian Am",
  "Tauhid",
  "Hadith",
  "Sirah Nabawiyah",
  "Tajwid & Tafsir",
  "Tazkirah Jumaat",
  "Pengurusan Jenazah",
  "Tahsin Al-Quran",
  "Tasauf – Kitab Nashaihul'ibad",
  "Tasauf – Kitab Minhaj Abideen",
  "Tasauf – Kitab Mukashafah Al-Qulub",
  "Tafsir – Kitab Tafsir Nurul Ehsan",
  "Tafsir – Kitab Tafsir Ibn Kathir",
  "Hadith – Kitab Riyadhus Salihin",
  "Fiqh – Kitab Hukum Hakam Solat Berjamaah",
  "Fiqh – Kitab Wisyahul Afrah Waisbahul Falah",
  "Fiqh – Kitab Panduan Ilmu Fiqh, Bab Solat",
  "Fiqh",
  "Wirid Khujakan",
  "Wirid Ratib Al-Atas",
  "Ceramah Maal Hijrah",
  "DITANGGUHKAN",
]

const PENGISIAN_JENIS = [
  "Pengajian Am", "Tauhid", "Hadith", "Sirah Nabawiyah",
  "Tajwid & Tafsir", "Tazkirah Jumaat", "Pengurusan Jenazah",
  "Tahsin Al-Quran", "Tasauf", "Tafsir", "Fiqh",
  "Wirid Khujakan", "Wirid Ratib Al-Atas", "Ceramah Maal Hijrah",
]

const KITAB_SEDIA_ADA = [
  "Kitab Nashaihul'ibad",
  "Kitab Minhaj Abideen",
  "Kitab Mukashafah Al-Qulub",
  "Kitab Tafsir Nurul Ehsan",
  "Kitab Tafsir Ibn Kathir",
  "Kitab Riyadhus Salihin",
  "Kitab Hukum Hakam Solat Berjamaah",
  "Kitab Wisyahul Afrah Waisbahul Falah",
  "Kitab Panduan Ilmu Fiqh, Bab Solat",
]

function kitabTeks(item) {
  const arr = Array.isArray(item?.kitab) ? item.kitab : (item?.kitab ? [item.kitab] : [])
  return arr.filter(Boolean).join(" & ")
}
const STATUS_OPTS = ["", "Hadir", "Ganti", "Tangguh"]
const WAKTU_OPTS = ["Subuh", "Duha", "Asar", "Jumaat", "Maghrib", "Isyak"]
const WAKTU_MASA_DEFAULT = { Subuh: "Selepas Solat Subuh", Duha: "9.00 pagi – 10.30 pagi", Asar: "Selepas Solat Asar", Maghrib: "Selepas Solat Maghrib", Isyak: "Selepas Solat Isyak", Jumaat: "12.30 tengah hari hingga masuk waktu Jumaat" }
const PROGRAM_OPTS = [
  "Kuliah Subuh","Kuliah Duha","Kuliah Asar","Kuliah Maghrib","Kuliah Isyak",
  "Tazkirah Jumaat","Kelas Muslimat","Majlis Zikir","Kelas Pegawai",
  "Ceramah Perdana Maal Hijrah 1448 H","Majlis Khatam Al-Quran",
  "Sambutan Maulidurasul","Program Tahlil Perdana","Ceramah Israk Mikraj",
  "Program Semarak Subuh","Sambutan Malam Nisfu Syaaban"
]
const DEFAULT_PROGRAM = { Subuh:"Kuliah Subuh",Duha:"Kuliah Duha",Asar:"Kuliah Asar",Maghrib:"Kuliah Maghrib",Isyak:"Kuliah Isyak",Jumaat:"Tazkirah Jumaat" }
function getNamaProgram(slot) { return slot.jenisProgram || DEFAULT_PROGRAM[slot.waktu] || "Program" }
const POSTER_THEMES = {
  "Kuliah Subuh":    { bg:[4,14,40],  acc:"#3b82f6", acl:"#93c5fd" },
  "Kuliah Duha":     { bg:[28,14,2],  acc:"#d97706", acl:"#fbbf24" },
  "Kuliah Asar":     { bg:[30,10,2],  acc:"#ea580c", acl:"#fb923c" },
  "Kuliah Maghrib":  { bg:[18,4,28],  acc:"#9333ea", acl:"#c084fc" },
  "Kuliah Isyak":    { bg:[6,4,24],   acc:"#8b5cf6", acl:"#a78bfa" },
  "Tazkirah Jumaat": { bg:[4,18,8],   acc:"#16a34a", acl:"#4ade80" },
  "Kelas Muslimat":  { bg:[28,4,14],  acc:"#db2777", acl:"#f472b6" },
  "Majlis Zikir":    { bg:[2,20,18],  acc:"#0d9488", acl:"#2dd4bf" },
  "Kelas Pegawai":   { bg:[8,12,20],  acc:"#475569", acl:"#94a3b8" },
}
const DEFAULT_THEME = { bg:[4,12,28], acc:"#c9a227", acl:"#fcd34d" }
const MAJLIS_BESAR_DATA = {
  "Ceramah Perdana Maal Hijrah 1448 H":  { bg:[20,4,8],  acc:"#c9a227", acl:"#fcd34d", bgImg:"/maal-hijrah-bg.png", ustazImg:"/maal-hijrah-ustaz.png", masa:"Bermula 7.00 mlm sehingga selesai jamuan", ayat:"وَمَن يُهَاجِرْ فِى سَبِيلِ ٱللَّهِ يَجِدْ فِى ٱلْأَرْضِ مُرَٰغَمًا كَثِيرًا وَسَعَةً", terjemah:"Dan sesiapa yang berhijrah pada jalan Allah (untuk membela dan menegakkan Islam), nescaya ia akan dapati di muka bumi ini tempat berhijrah yang banyak dan rezeki yang makmur.", src:"Surah An-Nisa': 100" },
  "Majlis Khatam Al-Quran":       { bg:[2,16,8],  acc:"#16a34a", acl:"#4ade80", ayat:"إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ", terjemah:"Sesungguhnya Al-Quran ini memberi petunjuk ke jalan yang paling lurus.", src:"Surah Al-Isra': 9" },
  "Sambutan Maulidurasul":        { bg:[2,14,4],  acc:"#16a34a", acl:"#86efac", ayat:"لَّقَدْ كَانَ لَكُمْ فِى رَسُولِ ٱللَّهِ أُسْوَةٌ حَسَنَةٌ", terjemah:"Sesungguhnya pada diri Rasulullah terdapat contoh teladan yang terbaik bagi kamu.", src:"Surah Al-Ahzab: 21" },
  "Program Tahlil Perdana":       { bg:[6,4,24],  acc:"#8b5cf6", acl:"#a78bfa", ayat:"كُلُّ نَفْسٍ ذَآئِقَةُ ٱلْمَوْتِ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ ٱلْقِيَـٰمَةِ", terjemah:"Setiap jiwa pasti merasai mati. Sesungguhnya akan disempurnakan pahala kamu pada Hari Kiamat.", src:"Surah Ali 'Imran: 185" },
  "Ceramah Israk Mikraj":         { bg:[10,4,28], acc:"#7c3aed", acl:"#c084fc", ayat:"سُبْحَـٰنَ ٱلَّذِىٓ أَسْرَىٰ بِعَبْدِهِۦ لَيْلًا مِّنَ ٱلْمَسْجِدِ ٱلْحَرَامِ إِلَى ٱلْمَسْجِدِ ٱلْأَقْصَا", terjemah:"Maha Suci Allah yang telah memperjalankan hamba-Nya pada suatu malam dari Masjidil Haram ke Masjidil Aqsa.", src:"Surah Al-Isra': 1" },
  "Program Semarak Subuh":        { bg:[20,8,2],  acc:"#f59e0b", acl:"#fcd34d", ayat:"وَقُرْءَانَ ٱلْفَجْرِ ۖ إِنَّ قُرْءَانَ ٱلْفَجْرِ كَانَ مَشْهُودًا", terjemah:"Dan (dirikanlah) bacaan Subuh. Sesungguhnya bacaan Subuh itu disaksikan oleh para malaikat.", src:"Surah Al-Isra': 78" },
  "Sambutan Malam Nisfu Syaaban": { bg:[2,12,20], acc:"#0ea5e9", acl:"#7dd3fc", ayat:"تَنَزَّلُ ٱلْمَلَـٰٓئِكَةُ وَٱلرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ", terjemah:"Para malaikat dan Ruh turun pada malam itu dengan izin Tuhan mereka untuk mengurus semua urusan.", src:"Surah Al-Qadr: 4" },
}
function getPosterTheme(slot) {
  const nama = getNamaProgram(slot)
  if (MAJLIS_BESAR_DATA[nama]) { const m = MAJLIS_BESAR_DATA[nama]; return { bg:m.bg, acc:m.acc, acl:m.acl } }
  if (nama.startsWith("Program ")) return { bg:[24,6,4], acc:"#b91c1c", acl:"#f87171" }
  return POSTER_THEMES[nama] || DEFAULT_THEME
}

function slotKosong() {
  return {
    id: crypto.randomUUID(), tarikh: "", hari: "Isnin", waktu: "Maghrib", jenisProgram: "", masaKustom: "",
    pengisian: "", penceramah: "", kadar: 100, sarapan: 0,
    status: "", ganti: "", sebenar: false, dariGanjak: false, muslimat: false, ditangguhJadual: false,
    programRasmi: false, notaProgram: "", kewanganSahaja: false, anjakanKe: "", anjakanDari: "", solatTasbih: false
  }
}
function mingguKosong(n) {
  return { id: crypto.randomUUID(), label: `Minggu ${n}`, slots: [slotKosong()] }
}
function agihKosong() {
  return { id: crypto.randomUUID(), jumlah: 0 }
}
// Kira slot permulaan tiap agihan + set slot "covered" (peruntukan asli sahaja,
// TIDAK termasuk anjakan extension — slot anjakan funded dari saguhati yang dipindah, bukan agihan terus)
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
    kumIsi.push(kum)   // jumlah kos slot yang benar-benar diisi oleh agihan ini (untuk kira lebihan)
    carry = budget - kum
    sisaSelepas.push(carry)
    cursor = lastCovered + 1
  }
  return { permulaan, covered, kumIsi, sisaSelepas }
}
// Pecahkan baki bulan lalu kepada 2 komponen berasingan:
//  - selainTotal: baki "Selain Subuh" (RM100/slot) — extend bajet agihan 1 secara berurutan
//  - subuhSlot/subuhTotal: baki "Subuh" (RM150/slot) — earmark untuk slot Subuh terawal, bebas dari agihan
// Sokong format lama (saguhati = selain subuh, sarapan = subuh) dan baru (selainSubuhSet/subuhSet).
function pecahBaki(bl) {
  bl = bl || {}
  const guna = (bl.subuhSet != null || bl.selainSubuhSet != null)
  const subuhSlot = guna ? (bl.subuhSet || 0) : ((bl.sarapan || 0) > 0 ? 1 : 0)
  const selainTotal = guna ? (bl.selainSubuhSet || 0) * 100 : (bl.saguhati || 0)
  const subuhTotal = guna ? (bl.subuhSet || 0) * 150 : (bl.sarapan || 0)
  return { subuhSlot, selainTotal, subuhTotal, total: selainTotal + subuhTotal }
}
function dataKosong(yyyymm) {
  const jumlahHari = yyyymm ? new Date(+yyyymm.split("-")[0], +yyyymm.split("-")[1], 0).getDate() : 28
  const jumlahMinggu = jumlahHari > 28 ? 5 : 4
  return {
    masjid: "Masjid Parit Setongkat",
    bakiLalu: { subuhSet: 0, selainSubuhSet: 0, catatan: "" },
    agihan: [],
    minggu: Array.from({ length: jumlahMinggu }, (_, i) => mingguKosong(i + 1))
  }
}
function labelDariBulan(yyyymm) {
  if (!yyyymm) return ""
  return new Date(yyyymm + "-02").toLocaleDateString("ms-MY", { month: "long", year: "numeric" })
}

// DOW: Ahad=0, Isnin=1, Selasa=2, Rabu=3, Khamis=4, Jumaat=5, Sabtu=6
const HARI_DOW_MAP = { Ahad: 0, Isnin: 1, Selasa: 2, Rabu: 3, Khamis: 4, Jumaat: 5, Sabtu: 6 }
const DOW_HARI = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"]
const NAMA_BULAN_SINGKAT = ["", "Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"]
const BULAN_SINGKAT_MAP = { Jan:1, Feb:2, Mac:3, Apr:4, Mei:5, Jun:6, Jul:7, Ogos:8, Sep:9, Okt:10, Nov:11, Dis:12 }
const WAKTU_SORT = { Subuh: 0, Duha: 1, Asar: 1.5, Jumaat: 2, Maghrib: 3, Isyak: 4 }
// Jam anggaran slot tamat (untuk tentukan "dah lepas" secara auto)
const WAKTU_CUTOFF_HOUR = { Subuh: 8, Duha: 11, Asar: 17, Jumaat: 15, Maghrib: 20, Isyak: 22 }

function formatTarikh(t) {
  if (!t) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [, m, d] = t.split("-").map(Number)
    return `${d} ${NAMA_BULAN_SINGKAT[m]}`
  }
  return t
}

function tarikhKeISO(t, bulanYYYYMM) {
  if (!t) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const mat = t.match(/^(\d{1,2})\s+(\w+)/)
  if (mat && bulanYYYYMM) {
    const bln = BULAN_SINGKAT_MAP[mat[2]]
    if (bln) return `${bulanYYYYMM.split("-")[0]}-${String(bln).padStart(2, "0")}-${mat[1].padStart(2, "0")}`
  }
  return ""
}

// Kira baki yang patut dibawa ke bulan BERIKUTNYA daripada data satu bulan.
// HANYA dua sumber yang menjadi baki (BUKAN slot yang sekadar "belum hadir"):
//   (A) Tangguh "Tiada Pengganti" yang COVERED tetapi tiada slot pengganti dalam bulan
//         - Subuh tangguh tanpa Subuh kemudian       → komponen Subuh (RM150/slot)
//         - Bukan-Subuh tangguh tanpa slot kemudian  → komponen Selain Subuh
//   (B) Lebihan agihan (over-allocation): bajet agihan melebihi kos slot yang diisi → Selain Subuh
// Slot belum hadir (status kosong) DIKIRA sebagai "diisi/dirizab" oleh agihan bulan ini,
// jadi ia TIDAK menjadi baki — ia akan dibayar bulan ini bila berlangsung.
function kiraBakiHadapan(d, bulanYYYYMM) {
  if (!d) return null
  const pb = pecahBaki(d.bakiLalu)
  const iso = s => tarikhKeISO(s.tarikh, bulanYYYYMM) || "z"
  const eligibleSorted = (d.minggu || [])
    .flatMap(m => m.slots)
    .filter(s => !s.muslimat && !s.ditangguhJadual && (s.kadar || 0) > 0)
    .sort((a, b) => iso(a).localeCompare(iso(b)))
  // Earmark Subuh terawal (baki bulan lalu) — dikecualikan dari jujukan agihan
  const earmarkSubuh = new Set(eligibleSorted.filter(s => s.waktu === "Subuh").slice(0, pb.subuhSlot).map(s => s.id))
  const eligibleForSeq = eligibleSorted.filter(s => !earmarkSubuh.has(s.id))
  const { covered, kumIsi } = hitungAgihanInfo(d.agihan || [], eligibleForSeq, pb.selainTotal)

  // (B) Lebihan agihan (over-allocation)
  let surplusTotal = 0
  ;(d.agihan || []).forEach((a, i) => {
    const budget = (a.jumlah || 0) + (i === 0 ? pb.selainTotal : 0)
    surplusTotal += Math.max(0, budget - (kumIsi[i] || 0))
  })

  // (A) Tangguh "Tiada Pengganti" yang COVERED & tiada pengganti kemudian (per waktu)
  const isTangguh = s => s.status === "Tangguh" && s.ganti === "Tiada Pengganti"
  const coveredSorted = eligibleForSeq.filter(s => covered.has(s.id))
  const kiraTangguhTakBerganti = (arr) => {
    const pakai = new Set()
    let n = 0, rm = 0
    for (let i = 0; i < arr.length; i++) {
      if (!isTangguh(arr[i])) continue
      let jumpa = false
      for (let j = i + 1; j < arr.length; j++) {
        if (pakai.has(arr[j].id) || isTangguh(arr[j])) continue   // pengganti mesti slot yang boleh berlangsung
        pakai.add(arr[j].id); jumpa = true; break
      }
      if (!jumpa) { n++; rm += (arr[i].kadar || 0) + (arr[i].sarapan || 0) }
    }
    return { n, rm }
  }
  const subuhTangguh = kiraTangguhTakBerganti(coveredSorted.filter(s => s.waktu === "Subuh"))
  const lainTangguh  = kiraTangguhTakBerganti(coveredSorted.filter(s => s.waktu !== "Subuh"))

  const subuhSet = subuhTangguh.n
  const selainSubuhSet = Math.max(0, Math.round((surplusTotal + lainTangguh.rm) / 100))
  return { subuhSet, selainSubuhSet }
}

const TEMPLATE_JADUAL = [
  // AHAD Subuh
  { hari: "Ahad", waktu: "Subuh", minggu: [
    { ke: 1, penceramah: "Ustaz Hj. Mohamad bin Abdullah", pengisian: "Pengajian Am", kadar: 100, sarapan: 50 },
    { ke: 2, penceramah: "Ustaz Hafizul Izani bin Lufti Amir", pengisian: "Pengajian Am", kadar: 100, sarapan: 50 },
    { ke: 3, penceramah: "Ustaz Jumat bin Jamil", pengisian: "Pengajian Am", kadar: 100, sarapan: 50 },
    { ke: 4, penceramah: "Ustaz Che Nur Azizi Aizuddin bin Che Abd Kadir", pengisian: "Tafsir – Kitab Tafsir Nurul Ehsan", kadar: 100, sarapan: 50 },
    { ke: 5, penceramah: "Ustaz Che Nur Azizi Aizuddin bin Che Abd Kadir", pengisian: "Tafsir – Kitab Tafsir Nurul Ehsan", kadar: 100, sarapan: 50 },
  ]},
  // AHAD Maghrib
  { hari: "Ahad", waktu: "Maghrib", minggu: [
    { ke: 1, penceramah: "Ustaz Mohd Hafizi bin Abd Samat", pengisian: "Tasauf – Kitab Minhaj Abideen", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Jamingan bin Sukran", pengisian: "Fiqh – Kitab Hukum Hakam Solat Berjamaah", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Nor Sakini bin Pasikah", pengisian: "Tafsir – Kitab Tafsir Ibn Kathir", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Jamingan bin Sukran", pengisian: "Fiqh – Kitab Hukum Hakam Solat Berjamaah", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Nor Sakini bin Pasikah", pengisian: "Tafsir – Kitab Tafsir Ibn Kathir", kadar: 100, sarapan: 0 },
  ]},
  // ISNIN Maghrib
  { hari: "Isnin", waktu: "Maghrib", minggu: [
    { ke: 1, penceramah: "Ustaz Khairul Syah bin Ahmad", pengisian: "Tasauf – Kitab Nashaihul'ibad", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Khairul Syah bin Ahmad", pengisian: "Tasauf – Kitab Nashaihul'ibad", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Khairul Syah bin Ahmad", pengisian: "Tasauf – Kitab Nashaihul'ibad", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Che Nur Azizi Aizuddin bin Che Abd Kadir", pengisian: "Fiqh – Kitab Wisyahul Afrah Waisbahul Falah", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Khairul Syah bin Ahmad", pengisian: "Tasauf – Kitab Nashaihul'ibad", kadar: 100, sarapan: 0 },
  ]},
  // SELASA Duha
  { hari: "Selasa", waktu: "Duha", minggu: [
    { ke: 1, penceramah: "Ustaz Hj. Tajuddin bin Abd Halim", pengisian: "Wirid Khujakan", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Hj. Tajuddin bin Abd Halim", pengisian: "Wirid Khujakan", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustazah Hajah Maryamah binti Kamijan", pengisian: "Tahsin Al-Quran", kadar: 0, sarapan: 0 },
    { ke: 4, penceramah: "Ustazah Hajah Maryamah binti Kamijan", pengisian: "Tahsin Al-Quran", kadar: 0, sarapan: 0 },
  ]},
  // SELASA Maghrib
  { hari: "Selasa", waktu: "Maghrib", minggu: [
    { ke: 1, penceramah: "Ustaz Masiat bin Abd Hamid", pengisian: "Tajwid & Tafsir", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Masiat bin Abd Hamid", pengisian: "Tajwid & Tafsir", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Masiat bin Abd Hamid", pengisian: "Tajwid & Tafsir", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Masiat bin Abd Hamid", pengisian: "Tajwid & Tafsir", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Masiat bin Abd Hamid", pengisian: "Tajwid & Tafsir", kadar: 100, sarapan: 0 },
  ]},
  // RABU Duha
  { hari: "Rabu", waktu: "Duha", minggu: [
    { ke: 1, penceramah: "Ustaz Hj. Paruddin bin Md. Naroh", pengisian: "Fiqh – Kitab Panduan Ilmu Fiqh, Bab Solat", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Hj. Paruddin bin Md. Naroh", pengisian: "Fiqh – Kitab Panduan Ilmu Fiqh, Bab Solat", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Hj. Paruddin bin Md. Naroh", pengisian: "Fiqh – Kitab Panduan Ilmu Fiqh, Bab Solat", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Hj. Paruddin bin Md. Naroh", pengisian: "Fiqh – Kitab Panduan Ilmu Fiqh, Bab Solat", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Hj. Paruddin bin Md. Naroh", pengisian: "Fiqh – Kitab Panduan Ilmu Fiqh, Bab Solat", kadar: 100, sarapan: 0 },
  ]},
  // RABU Maghrib
  { hari: "Rabu", waktu: "Maghrib", minggu: [
    { ke: 1, penceramah: "Ustaz Norhakim bin Rafique", pengisian: "Pengajian Am", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Hj. Ilham bin Imam", pengisian: "Hadith – Kitab Riyadhus Salihin", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Fadhil bin Muhammad Amin", pengisian: "Wirid Ratib Al-Atas", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Hj. Ilham bin Imam", pengisian: "Hadith – Kitab Riyadhus Salihin", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Hj. Ilham bin Imam", pengisian: "Hadith – Kitab Riyadhus Salihin", kadar: 100, sarapan: 0 },
  ]},
  // KHAMIS Duha (Minggu 1 & 2 sahaja)
  { hari: "Khamis", waktu: "Duha", minggu: [
    { ke: 1, penceramah: "Ustazah Zabediah binti Othman", pengisian: "Pengurusan Jenazah", kadar: 0, sarapan: 0 },
    { ke: 2, penceramah: "Ustazah Zabediah binti Othman", pengisian: "Pengurusan Jenazah", kadar: 0, sarapan: 0 },
  ]},
  // KHAMIS Maghrib (Pegawai Bertugas)
  { hari: "Khamis", waktu: "Maghrib", minggu: [
    { ke: 1, penceramah: "", jenisProgram: "Kelas Pegawai", pengisian: "", kadar: 0, sarapan: 0 },
    { ke: 2, penceramah: "", jenisProgram: "Kelas Pegawai", pengisian: "", kadar: 0, sarapan: 0 },
    { ke: 3, penceramah: "", jenisProgram: "Kelas Pegawai", pengisian: "", kadar: 0, sarapan: 0 },
    { ke: 4, penceramah: "", jenisProgram: "Kelas Pegawai", pengisian: "", kadar: 0, sarapan: 0 },
  ]},
  // JUMAAT Tazkirah
  { hari: "Jumaat", waktu: "Jumaat", minggu: [
    { ke: 1, penceramah: "Ustaz Iskandar bin Hamzah", pengisian: "Tazkirah Jumaat", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Omar bin Abu Bakar", pengisian: "Tazkirah Jumaat", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Hafizul Izani bin Lufti Amir", pengisian: "Tazkirah Jumaat", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Norhisham bin Jaliman", pengisian: "Tazkirah Jumaat", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Lutfi bin Abdul Latif", pengisian: "Tazkirah Jumaat", kadar: 100, sarapan: 0 },
  ]},
  // JUMAAT Maghrib
  { hari: "Jumaat", waktu: "Maghrib", minggu: [
    { ke: 1, penceramah: "Ustaz Hj. Ishak bin Nor", pengisian: "Tauhid", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Ahmad Faiz bin Abd Rashid", pengisian: "Tasauf – Kitab Mukashafah Al-Qulub", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Hj. Paruddin bin Md. Naroh", pengisian: "Fiqh", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Ahmad Faiz bin Abd Rashid", pengisian: "Tasauf – Kitab Mukashafah Al-Qulub", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Omar bin Abu Bakar", pengisian: "Pengajian Am", kadar: 100, sarapan: 0 },
  ]},
  // SABTU Maghrib
  { hari: "Sabtu", waktu: "Maghrib", minggu: [
    { ke: 1, penceramah: "Ustaz Aiman bin Muhammad", pengisian: "Hadith", kadar: 100, sarapan: 0 },
    { ke: 2, penceramah: "Ustaz Aiman bin Muhammad", pengisian: "Hadith", kadar: 100, sarapan: 0 },
    { ke: 3, penceramah: "Ustaz Hj. Mohamad bin Abdullah", pengisian: "Sirah Nabawiyah", kadar: 100, sarapan: 0 },
    { ke: 4, penceramah: "Ustaz Hj. Mohamad bin Abdullah", pengisian: "Sirah Nabawiyah", kadar: 100, sarapan: 0 },
    { ke: 5, penceramah: "Ustaz Hj. Mohamad bin Abdullah", pengisian: "Sirah Nabawiyah", kadar: 100, sarapan: 0 },
  ]},
]

function migrasiTemplat(data) {
  let result = data.map(grup => ({
    ...grup,
    minggu: grup.minggu.map(m => ({
      ...m,
      jenisProgram: m.jenisProgram || DEFAULT_PROGRAM[grup.waktu] || ""
    }))
  }))
  for (const tmpl of TEMPLATE_JADUAL) {
    if (!result.some(g => g.hari === tmpl.hari && g.waktu === tmpl.waktu)) {
      result.push({ ...tmpl, minggu: tmpl.minggu.map(m => ({ ...m, jenisProgram: m.jenisProgram || DEFAULT_PROGRAM[tmpl.waktu] || "" })) })
    }
  }
  const order = TEMPLATE_JADUAL.map(t => `${t.hari}|${t.waktu}`)
  result.sort((a, b) => {
    const ai = order.indexOf(`${a.hari}|${a.waktu}`)
    const bi = order.indexOf(`${b.hari}|${b.waktu}`)
    return (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi)
  })
  return result
}

function cariTarikhMingguKe(tahun, bulan, hariDOW, mingguKe) {
  const jumlahHari = new Date(tahun, bulan, 0).getDate()
  let kira = 0
  for (let h = 1; h <= jumlahHari; h++) {
    if (new Date(tahun, bulan - 1, h).getDay() === hariDOW) {
      kira++
      if (kira === mingguKe) return h
    }
  }
  return null
}

function janaJadualDariTemplate(yyyymm) {
  const [tahun, bulan] = yyyymm.split("-").map(Number)
  const label = NAMA_BULAN_SINGKAT[bulan]
  const LABEL_MINGGU = [
    "Minggu 1 (1-7)", "Minggu 2 (8-14)", "Minggu 3 (15-21)",
    "Minggu 4 (22-28)", "Minggu 5 (29+)"
  ]
  const kumpulan = [[], [], [], [], []]

  let tmplSource = migrasiTemplat(TEMPLATE_JADUAL.map(g => ({ ...g, minggu: g.minggu.map(m => ({ ...m })) })))
  try { const s = localStorage.getItem("alc_biro_templat"); if (s) tmplSource = migrasiTemplat(JSON.parse(s)) } catch {}
  for (const tmpl of tmplSource) {
    const dow = HARI_DOW_MAP[tmpl.hari]
    for (const m of tmpl.minggu) {
      const hariNum = cariTarikhMingguKe(tahun, bulan, dow, m.ke)
      if (!hariNum) continue
      const idx = hariNum <= 7 ? 0 : hariNum <= 14 ? 1 : hariNum <= 21 ? 2 : hariNum <= 28 ? 3 : 4
      kumpulan[idx].push({
        id: crypto.randomUUID(),
        tarikh: `${hariNum} ${label}`,
        hari: tmpl.hari,
        waktu: tmpl.waktu,
        pengisian: m.pengisian,
        jenisProgram: m.jenisProgram || "",
        penceramah: m.penceramah,
        kadar: m.kadar,
        sarapan: m.sarapan,
        status: "", ganti: "", sebenar: false, dariGanjak: false, ditangguhJadual: false, programRasmi: false, notaProgram: "", kewanganSahaja: false, anjakanKe: "", anjakanDari: "",
        _h: hariNum
      })
    }
  }

  for (const k of kumpulan) {
    k.sort((a, b) => a._h - b._h || (WAKTU_SORT[a.waktu] ?? 9) - (WAKTU_SORT[b.waktu] ?? 9))
    k.forEach(s => delete s._h)
  }

  const minggu = kumpulan
    .map((slots, i) => ({ id: crypto.randomUUID(), label: LABEL_MINGGU[i], agihan: 0, slots }))
    .filter(m => m.slots.length > 0)

  return {
    masjid: "Masjid Parit Setongkat",
    bakiLalu: { subuhSet: 0, selainSubuhSet: 0, catatan: "" },
    agihan: [],
    minggu: minggu.length > 0 ? minggu : [mingguKosong(1)]
  }
}

export default function BiroPendidikan({ onKembali = () => {}, onSetBack }) {
  const { C } = useTheme()
  const statusWarna = { "Hadir": C.green, "Ganti": C.primary, "Tangguh": C.warning, "": C.txtMuted }
  const waktuWarna = { Subuh: C.blueLt, Duha: C.warningLt, Asar: "#fff7ed", Jumaat: C.greenLt, Maghrib: C.dangerLt, Isyak: C.purpleLt }
  const waktuText = { Subuh: C.primaryDk, Duha: C.warning, Asar: "#c2410c", Jumaat: C.green, Maghrib: C.danger, Isyak: C.purple }
  const [view, setView] = useState("senarai")
  const [bulanList, setBulanList] = useState([])
  const [bulanAktif, setBulanAktif] = useState(null)
  const [data, setData] = useState(null)
  const [penceramahList, setPenceramahList] = useState([])
  const [semPenceramah, setSemPenceramah] = useState([])
  const [loading, setLoading] = useState(true)
  const [simpanLoading, setSimpanLoading] = useState(false)
  const [cetakLoading, setCetakLoading] = useState(false)
  const [waLoading, setWaLoading] = useState(false)
  const [praState, setPraState] = useState(null)
  const [laporanLoading, setLaporanLoading] = useState(false)
  const [praLaporanState, setPraLaporanState] = useState(null)
  const [adaUbah, setAdaUbah] = useState(false)
  const [mingguBuka, setMingguBuka] = useState({})
  const [expandSlot, setExpandSlot] = useState(null)
  const [menuSlot, setMenuSlot] = useState(null)
  const [padamKonfirmSlot, setPadamKonfirmSlot] = useState(null)
  const [modalBulanBaru, setModalBulanBaru] = useState(false)
  const [modalPenceramah, setModalPenceramah] = useState(false)
  const [formBulan, setFormBulan] = useState({ bulan: "", kaedah: "template" })
  const [penceramahBaru, setPenceramahBaru] = useState("")
  const [editPenceramah, setEditPenceramah] = useState(null)
  const [konfirmasiPadam, setKonfirmasiPadam] = useState(null)
  const [menuBulan, setMenuBulan] = useState(null)
  const [tab, setTab] = useState("jadual")
  const [modalLogKeluar, setModalLogKeluar] = useState(false)
  const [passwordLogKeluar, setPasswordLogKeluar] = useState("")
  const [tunjukPasswordLogKeluar, setTunjukPasswordLogKeluar] = useState(false)
  const [ralatLogKeluar, setRalatLogKeluar] = useState("")
  const [loadingLogKeluar, setLoadingLogKeluar] = useState(false)
  const [notisAutoJana, setNotisAutoJana] = useState(null)
  const [senaraiPengisian, setSenaraiPengisian] = useState([])
  const [senaraiKitab, setSenaraiKitab] = useState([])
  const [modalSenarai, setModalSenarai] = useState(false)
  const [inputSenarai, setInputSenarai] = useState({ pengisian: "", kitab: "" })
  const [editSenarai, setEditSenarai] = useState(null)
  const [tabRujukan, setTabRujukan] = useState("penceramah")
  const [templatData, setTemplatData] = useState(() => {
    try { const s = localStorage.getItem("alc_biro_templat"); return migrasiTemplat(s ? JSON.parse(s) : TEMPLATE_JADUAL.map(g => ({ ...g, minggu: g.minggu.map(m => ({ ...m })) }))) }
    catch { return migrasiTemplat(TEMPLATE_JADUAL.map(g => ({ ...g, minggu: g.minggu.map(m => ({ ...m })) }))) }
  })
  const [templatUbah, setTemplatUbah] = useState(false)
  const [masaWaktu, setMasaWaktu] = useState(() => {
    try { const s = localStorage.getItem("alc_biro_masa_waktu"); return { ...WAKTU_MASA_DEFAULT, ...(s ? JSON.parse(s) : {}) } }
    catch { return { ...WAKTU_MASA_DEFAULT } }
  })
  const [modalTetapanMasa, setModalTetapanMasa] = useState(false)
  const [copiedSlotId, setCopiedSlotId] = useState(null)
  const [gambarUploadLoading, setGambarUploadLoading] = useState(null)
  const [bendahariLink, setBendahariLink] = useState("")
  const [salinLink, setSalinLink] = useState(false)
  const [pratontonBendahari, setPratontonBendahari] = useState(false)
  const [pratontonPoster, setPratontonPoster] = useState(null)
  const [showSenaraiKad, setShowSenaraiKad] = useState(false)
  const [showFabMenu, setShowFabMenu] = useState(false)
  const [templatExpandGrup, setTemplatExpandGrup] = useState({})
  const [templFormGrup, setTemplFormGrup] = useState({ hari: "Isnin", waktu: "Maghrib" })
  const [templTunjukFormGrup, setTemplTunjukFormGrup] = useState(false)
  const autoJanaRan = useRef(false)

  useEffect(() => { muatSemua() }, [])

  useEffect(() => {
    if (!onSetBack) return
    onSetBack(() => {
      if (view !== "senarai") { setView("senarai"); return true }
      return false
    })
  }, [view, onSetBack])

  // Auto-simpan ke localStorage bila senarai berubah (mod tempatan sahaja)
  useEffect(() => {
    if (!senaraiPengisian.length && !senaraiKitab.length) return
    if (senaraiPengisian.some(x => isLocalId(x.id)) || senaraiKitab.some(x => isLocalId(x.id))) {
      localStorage.setItem("biro_senarai_local", JSON.stringify([...senaraiPengisian, ...senaraiKitab]))
    }
  }, [senaraiPengisian, senaraiKitab])

  // Auto-fetch senarai dari DB bila view rujukan dibuka (jika masih dalam mod tempatan)
  useEffect(() => {
    if (view !== "rujukan") return
    if (!senaraiPengisian.some(x => x.id?.startsWith("_L_"))) return
    supabase.from("biro_senarai").select("*").order("nilai").then(({ data: s }) => {
      if (s !== null) muatSenarai(s)
    })
  }, [view])

  // Auto-save 1.5s selepas sebarang perubahan
  useEffect(() => {
    if (!adaUbah || !bulanAktif?.id) return
    const t = setTimeout(async () => {
      setSimpanLoading(true)
      await supabase.from("biro_bulan").update({ data, dikemas_pada: new Date().toISOString() }).eq("id", bulanAktif.id)
      setSimpanLoading(false)
      setAdaUbah(false)
    }, 1500)
    return () => clearTimeout(t)
  }, [data, adaUbah, bulanAktif?.id])

  useEffect(() => {
    if (!showFabMenu) return
    const close = () => setShowFabMenu(false)
    const t = setTimeout(() => {
      document.addEventListener("click", close, { once: true })
      window.addEventListener("scroll", close, { once: true, passive: true })
    }, 0)
    return () => { clearTimeout(t); document.removeEventListener("click", close); window.removeEventListener("scroll", close) }
  }, [showFabMenu])

  async function muatSemua() {
    setLoading(true)
    const [{ data: b }, { data: p }, { data: s }, { data: tetapan }] = await Promise.all([
      supabase.from("biro_bulan").select("id,bulan,label,dikemas_pada").order("bulan", { ascending: false }),
      supabase.from("biro_penceramah").select("*").order("nama"),
      supabase.from("biro_senarai").select("*").order("nilai"),
      supabase.from("tetapan").select("bendahari_token").maybeSingle(),
    ])
    if (tetapan?.bendahari_token) setBendahariLink(`${window.location.origin}/?bendahari=${tetapan.bendahari_token}`)
    let senaraiBulan = b || []
    setBulanList(senaraiBulan)
    setSemPenceramah(p || [])
    setPenceramahList((p || []).filter(x => x.aktif))
    await muatSenarai(s)

    if (!autoJanaRan.current) {
      autoJanaRan.current = true
      const today = new Date()
      if (today.getDate() >= 27) {
        const nextDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        const nextYYYYMM = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`
        const sudahAda = senaraiBulan.some(x => x.bulan === nextYYYYMM)
        if (!sudahAda) {
          const newData = janaJadualDariTemplate(nextYYYYMM)
          const lbl = labelDariBulan(nextYYYYMM)
          await supabase.from("biro_bulan").insert({ bulan: nextYYYYMM, label: lbl, data: newData })
          const { data: b2 } = await supabase.from("biro_bulan").select("id,bulan,label,dikemas_pada").order("bulan", { ascending: false })
          setBulanList(b2 || [])
          setNotisAutoJana(lbl)
          setTimeout(() => setNotisAutoJana(null), 6000)
        }
      }
    }

    setLoading(false)
  }

  async function bukaBulan(rekod) {
    setLoading(true)
    const { data: d } = await supabase.from("biro_bulan").select("*").eq("id", rekod.id).single()
    setBulanAktif(d)
    // Migrasi format lama (agihan per-minggu) ke format baru (agihan array di root)
    let dataFinal = d.data
    if (!Array.isArray(dataFinal.agihan)) {
      const jumlahLama = (dataFinal.minggu || []).reduce((a, m) => a + (m.agihan || 0), 0)
      dataFinal = {
        ...dataFinal,
        agihan: jumlahLama > 0 ? [{ id: crypto.randomUUID(), tarikh: "", jumlah: jumlahLama }] : []
      }
    }
    // Auto-anjak baki ke bulan ini: kira dari bulan sebelum (Subuh tangguh hujung bulan + lebihan agihan).
    // "Baki Subuh" jadi sumber utama automatik supaya Subuh tangguh akhir bulan lalu masuk Subuh Ahad pertama.
    try {
      const prevRekod = (bulanList || [])
        .filter(x => x.bulan && d.bulan && x.bulan < d.bulan)
        .sort((a, b) => b.bulan.localeCompare(a.bulan))[0]
      if (prevRekod) {
        const { data: prev } = await supabase.from("biro_bulan").select("data,bulan").eq("id", prevRekod.id).single()
        const carry = prev?.data ? kiraBakiHadapan(prev.data, prev.bulan) : null
        if (carry) {
          const bl = dataFinal.bakiLalu || { subuhSet: 0, selainSubuhSet: 0, catatan: "" }
          if ((bl.subuhSet || 0) !== carry.subuhSet || (bl.selainSubuhSet || 0) !== carry.selainSubuhSet) {
            dataFinal = { ...dataFinal, bakiLalu: { ...bl, subuhSet: carry.subuhSet, selainSubuhSet: carry.selainSubuhSet } }
            await supabase.from("biro_bulan").update({ data: dataFinal, dikemas_pada: new Date().toISOString() }).eq("id", d.id)
          }
        }
      }
    } catch { /* abaikan ralat auto-anjak — jangan halang buka bulan */ }
    setData(dataFinal)
    const _hariIni = new Date().toISOString().slice(0, 10)
    const _bulanYM = d.bulan || ""
    let _mingguIdx = 0
    if (dataFinal.minggu?.length) {
      const _found = dataFinal.minggu.findIndex(m =>
        m.slots.some(s => { const iso = tarikhKeISO(s.tarikh, _bulanYM); return iso && iso >= _hariIni })
      )
      _mingguIdx = _found >= 0 ? _found : dataFinal.minggu.length - 1
    }
    setMingguBuka({ [_mingguIdx]: true })
    setAdaUbah(false)
    setExpandSlot(null)
    setTab("jadual")
    setView("bulan")
    setLoading(false)
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

  function kemasMasaWaktu(waktu, val) {
    setMasaWaktu(prev => {
      const next = { ...prev, [waktu]: val }
      try { localStorage.setItem("alc_biro_masa_waktu", JSON.stringify(next)) } catch {}
      return next
    })
  }

  function autoAnjakan() {
    kemas(d => {
      const _pbA = pecahBaki(d.bakiLalu)
      const bakiLaluTotal = _pbA.selainTotal // hanya Selain Subuh extend bajet agihan berurutan
      const agihanArr = d.agihan || []
      if (!agihanArr.length) return

      // Kumpul semua slot eligible, sort by tarikh
      // programRasmi dimasukkan walaupun kadar=0 supaya ia menjadi sasaran anjakan
      const flatAll = []
      d.minggu.forEach(m => {
        m.slots.forEach(s => {
          if ((!s.kadar && !s.programRasmi) || s.muslimat || s.ditangguhJadual) return
          flatAll.push({ s, iso: tarikhKeISO(s.tarikh, bulanAktif?.bulan) || "z" })
        })
      })
      flatAll.sort((a, b) => a.iso.localeCompare(b.iso))
      // Kecualikan slot Subuh earmark supaya agihan tidak bayar berganda (programRasmi dikecualikan dari earmark)
      const _earmarkSubuhAutoA = new Set(
        flatAll.filter(e => e.s.waktu === "Subuh" && !e.s.programRasmi).slice(0, _pbA.subuhSlot).map(e => e.s.id)
      )
      const flat = flatAll.filter(e => !_earmarkSubuhAutoA.has(e.s.id))

      // Bersih anjakan lama
      d.minggu.forEach(m => m.slots.forEach(s => { s.anjakanKe = ""; s.anjakanDari = "" }))

      let cursor = 0 // mula indeks dalam flat untuk setiap period
      for (let p = 0; p < agihanArr.length; p++) {
        const budget = (agihanArr[p].jumlah || 0) + (p === 0 ? bakiLaluTotal : 0)
        if (!budget || cursor >= flat.length) continue

        // Cari natural end period ini (kumulatif ≤ budget, berhenti sebelum slot programRasmi)
        let kum = 0, idxAkhir = cursor - 1
        for (let i = cursor; i < flat.length; i++) {
          if (flat[i].s.programRasmi) break // programRasmi tidak dikira dalam bajet — jadi sempadan semula jadi
          const kos = (flat[i].s.kadar || 0) + (flat[i].s.sarapan || 0)
          if (kum + kos <= budget) { kum += kos; idxAkhir = i } else break
        }
        if (idxAkhir < cursor) continue // budget tak cukup satu slot pun

        // Pisah tangguh (Tiada Pengganti) dalam period: Subuh vs bukan-Subuh
        const tangguhSubuh = [], tangguhLain = []
        for (let i = cursor; i <= idxAkhir; i++) {
          const s = flat[i].s
          if (s.status !== "Tangguh" || s.ganti !== "Tiada Pengganti") continue
          if (s.waktu === "Subuh") tangguhSubuh.push(s)
          else tangguhLain.push(s)
        }

        // Bukan-Subuh: anjak ke slot kronologi seterusnya selepas natural end
        let extCursor = idxAkhir + 1
        for (const ts of tangguhLain) {
          if (extCursor >= flat.length) break
          const cs = flat[extCursor].s
          ts.anjakanKe = `${formatTarikh(cs.tarikh)} ${cs.hari} ${cs.waktu}`
          cs.anjakanDari = `${formatTarikh(ts.tarikh)} ${ts.hari} ${ts.waktu}`
          extCursor++
        }

        // Subuh: anjak ke slot SUBUH seterusnya selepas natural end
        let subuhCari = idxAkhir + 1
        for (const ts of tangguhSubuh) {
          for (let j = subuhCari; j < flat.length; j++) {
            if (flat[j].s.waktu === "Subuh") {
              const cs = flat[j].s
              ts.anjakanKe = `${formatTarikh(cs.tarikh)} ${cs.hari} ${cs.waktu}`
              cs.anjakanDari = `${formatTarikh(ts.tarikh)} ${ts.hari} ${ts.waktu}`
              subuhCari = j + 1
              break
            }
          }
        }

        // Cursor period seterusnya: selepas semua extension, langkau slot programRasmi di hadapan
        cursor = extCursor
        while (cursor < flat.length && flat[cursor].s.programRasmi) cursor++
      }
    })
  }

  function janaWaMsg(slot) {
    const iso = tarikhKeISO(slot.tarikh, bulanAktif?.bulan)
    const dt = iso ? new Date(iso + "T00:00:00") : null
    const BLN = ["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"]
    const tarikhStr = dt ? `${dt.getDate()} ${BLN[dt.getMonth()]} ${dt.getFullYear()}` : (slot.tarikh || "")
    const masjid = data?.masjid || "Masjid"
    const prefix = (slot.penceramah || "").includes("Ustazah") ? "Al-Fadhilah " : "Al-Fadhil "
    const penceramah = slot.penceramah || ""
    const pengisian = getPengisian(slot)
    const hari = slot.hari || ""
    const waktu = slot.waktu || ""
    const mingguKe = dt ? Math.ceil(dt.getDate() / 7) : 1
    const masa = slot.masaKustom || masaWaktu[waktu] || ""
    const salam = "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ\n\n"

    if (slot.jenisProgram === "Kelas Muslimat") return `${salam}👩 *KELAS MUSLIMAT*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Pengajar:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Muslimat dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    if (slot.jenisProgram === "Kelas Pegawai") return `${salam}📋 *KELAS PEGAWAI*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Pengajar:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Pegawai masjid dijemput hadir 🤲`
    const isZikir = slot.jenisProgram === "Majlis Zikir" || (waktu === "Maghrib" && hari === "Rabu" && mingguKe === 3) || (waktu === "Duha" && hari === "Selasa")
    if (isZikir) return `${salam}📿 *MAJLIS ZIKIR*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Dipimpin oleh:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Muslimin dan Muslimat dijemput hadir bersama-sama mengimarahkan majlis zikir ini 🤲`

    if (waktu === "Subuh") return `${salam}📘 *KULIAH SUBUH*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    if (waktu === "Asar") return `${salam}🌤 *KULIAH ASAR*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    if (waktu === "Maghrib") return `${salam}📚 *KULIAH MAGHRIB*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    if (waktu === "Isyak") return `${salam}📚 *KULIAH ISYAK*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    if (waktu === "Duha" && hari === "Rabu") {
      if (mingguKe === 1 || mingguKe === 3) return `${salam}☀️ *KULIAH DUHA*\n\n🗓 *Rabu | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n🕋 Solat tasbih akan diadakan sebelum kuliah\n🍽 Jamuan disediakan.\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
      return `${salam}☀️ *KULIAH DUHA*\n\n🗓 *Rabu | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎤 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n🍴 Jamuan disediakan.\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    }
    if (waktu === "Duha") return `${salam}☀️ *KULIAH DUHA*\n\n🗓 *${hari} | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎙 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    if (waktu === "Jumaat") return `${salam}🕌 *TAZKIRAH JUMAAT*\n\n🗓 *Jumaat | ${tarikhStr}*\n⏰ \`${masa}\`\n📍 *${masjid}*\n\n🎤 *Penceramah:*\n${prefix}${penceramah}\n\n📖 *Pengisian:*\n${pengisian}\n\n✨ Jemaah dijemput hadir bersama-sama mengimarahkan majlis ilmu 🤲`
    return ""
  }

  async function simpan() {
    if (!bulanAktif || simpanLoading) return
    setSimpanLoading(true)
    await supabase.from("biro_bulan").update({ data, dikemas_pada: new Date().toISOString() }).eq("id", bulanAktif.id)
    setSimpanLoading(false)
    setAdaUbah(false)
  }

  async function buatBulanBaru() {
    if (!formBulan.bulan) return
    setSimpanLoading(true)
    const newData = formBulan.kaedah === "template"
      ? janaJadualDariTemplate(formBulan.bulan)
      : dataKosong(formBulan.bulan)
    const { data: baru, error } = await supabase.from("biro_bulan")
      .insert({ bulan: formBulan.bulan, label: labelDariBulan(formBulan.bulan), data: newData })
      .select().single()
    setSimpanLoading(false)
    if (!error) {
      setModalBulanBaru(false)
      setFormBulan({ bulan: "", kaedah: "template" })
      await muatSemua()
      if (baru) bukaBulan(baru)
    }
  }

  async function padamBulan(id) {
    await supabase.from("biro_bulan").delete().eq("id", id)
    setKonfirmasiPadam(null)
    await muatSemua()
  }

  async function handleLogKeluar(e) {
    e.preventDefault()
    if (!passwordLogKeluar) return setRalatLogKeluar("Sila masuk kata laluan.")
    setLoadingLogKeluar(true)
    setRalatLogKeluar("")
    const { error } = await supabase.auth.signInWithPassword({ email: EMEL_AKAUN, password: passwordLogKeluar })
    setLoadingLogKeluar(false)
    if (error) setRalatLogKeluar("Kata laluan salah.")
    else onKembali()
  }

  async function tambahPenceramah() {
    if (!penceramahBaru.trim()) return
    const { data: p, error } = await supabase.from("biro_penceramah").insert({ nama: penceramahBaru.trim(), aktif: true }).select().single()
    if (error) { alert("Gagal tambah: " + error.message); return }
    if (p) {
      const semua = [...semPenceramah, p].sort((a, b) => a.nama.localeCompare(b.nama))
      setSemPenceramah(semua)
      setPenceramahList(semua.filter(x => x.aktif))
      setPenceramahBaru("")
    }
  }

  async function muatPenceramahSediaAda() {
    const namaAda = new Set(semPenceramah.map(p => p.nama))
    const baharu = PENCERAMAH_SEDIA_ADA.filter(n => !namaAda.has(n)).map(nama => ({ nama, aktif: true }))
    if (baharu.length === 0) return
    const { data: hasil, error } = await supabase.from("biro_penceramah").insert(baharu).select()
    if (error) { alert("Gagal import: " + error.message); return }
    if (hasil) {
      const semua = [...semPenceramah, ...hasil].sort((a, b) => a.nama.localeCompare(b.nama))
      setSemPenceramah(semua)
      setPenceramahList(semua.filter(x => x.aktif))
    }
  }

  async function togolPenceramah(id, aktif) {
    await supabase.from("biro_penceramah").update({ aktif: !aktif }).eq("id", id)
    const semua = semPenceramah.map(p => p.id === id ? { ...p, aktif: !aktif } : p)
    setSemPenceramah(semua)
    setPenceramahList(semua.filter(x => x.aktif))
  }

  async function padamPenceramah(id) {
    const { error } = await supabase.from("biro_penceramah").delete().eq("id", id)
    if (error) { alert("Gagal padam: " + error.message); return }
    const semua = semPenceramah.filter(p => p.id !== id)
    setSemPenceramah(semua)
    setPenceramahList(semua.filter(x => x.aktif))
    setEditPenceramah(null)
  }

  async function kemasKiniPenceramah(id, changes) {
    const { error } = await supabase.from("biro_penceramah").update(changes).eq("id", id)
    if (error) { alert("Gagal simpan: " + error.message); return }
    const semua = semPenceramah.map(p => p.id === id ? { ...p, ...changes } : p)
    setSemPenceramah(semua)
    setPenceramahList(semua.filter(x => x.aktif))
    setEditPenceramah(null)
  }

  async function handleGambarUpload(e, penceramahId) {
    const file = e.target.files[0]
    if (!file) return
    setGambarUploadLoading(penceramahId)
    const ext = file.name.split(".").pop().toLowerCase()
    const path = `${penceramahId}.${ext}`
    const { error } = await supabase.storage.from("penceramah").upload(path, file, { upsert: true })
    setGambarUploadLoading(null)
    if (error) { alert("Gagal muat naik: " + error.message); return }
    const { data: { publicUrl } } = supabase.storage.from("penceramah").getPublicUrl(path)
    setEditPenceramah(p => ({ ...p, gambar_url: publicUrl + '?t=' + Date.now() }))
  }

  async function janaPosterId(slot, mingguKe = 1) {
    const pObj = semPenceramah.find(p => p.nama === slot.penceramah)
    const gambarUrl = pObj?.gambar_url
    const theme = getPosterTheme(slot)
    const [TR, TG, TB] = theme.bg
    const ACC = theme.acc, ACL = theme.acl
    const hexRgba = (hex, a) => { const [r,g,b] = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)); return `rgba(${r},${g},${b},${a})` }
    const GOLD = "#c9a227", GOLDL = "#fcd34d"
    const goldRgba = a => `rgba(201,162,39,${a})`
    const W = 1080, H = 1440
    const canvas = document.createElement("canvas")
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext("2d")

    // ── Load Google Fonts (idempotent) ──
    if (!document.getElementById("_gf_poster")) {
      const lnk = document.createElement("link")
      lnk.id = "_gf_poster"
      lnk.rel = "stylesheet"
      lnk.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Great+Vibes&family=Lato:ital,wght@0,300;0,400;0,700;1,400;1,700&family=Amiri&display=swap"
      document.head.appendChild(lnk)
      await new Promise(r => setTimeout(r, 900))
    }
    await Promise.allSettled([
      document.fonts.load("900 16px 'Playfair Display'"),
      document.fonts.load("16px 'Great Vibes'"),
      document.fonts.load("700 16px Lato"),
      document.fonts.load("16px Amiri"),
    ])

    // ── Load images ──
    const loadImg = url => new Promise(resolve => {
      const img = new Image(); img.crossOrigin = "anonymous"
      img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = url
    })
    const slotMbd = MAJLIS_BESAR_DATA[slot.jenisProgram || ""]
    const bgImgUrl = slotMbd?.bgImg ? window.location.origin + slotMbd.bgImg : window.location.origin + "/masjid-bg.jpg"
    // If this majlis besar has a dedicated ustaz photo, prefer it over the db gambar
    const ustazImgUrl = slotMbd?.ustazImg ? window.location.origin + slotMbd.ustazImg : null
    const [speakerImg, logoImg, masjidImg] = await Promise.all([
      ustazImgUrl ? loadImg(ustazImgUrl) : (gambarUrl ? loadImg(gambarUrl) : Promise.resolve(null)),
      loadImg(window.location.origin + "/logo-masjid.jpg"),
      loadImg(bgImgUrl),
    ])

    // Layout constants — Portrait 1080×1920
    const CX = W / 2               // 540 — vertical centre axis
    const PR = 140, PX = CX, PY = 800   // speaker photo (PR=radius, PY approx for spotlight)

    // ── Layer 1: Background photo (less blur for majlis besar so image shows through) ──
    if (masjidImg) {
      ctx.filter = slotMbd ? "blur(2px)" : "blur(7px)"
      const imgA = masjidImg.naturalWidth / masjidImg.naturalHeight
      const canA = W / H
      let dw, dh, dx = 0, dy = 0
      if (imgA > canA) { dh = H + 14; dw = dh * imgA; dx = (W - dw) / 2 }
      else              { dw = W + 14; dh = dw / imgA; dy = (H - dh) / 2 }
      ctx.drawImage(masjidImg, dx, dy, dw, dh)
      ctx.filter = "none"
    } else {
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, "#0a1f4a"); bg.addColorStop(1, "#0e3a2a")
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    }

    // ── Layer 2: Dark overlay (majlis besar = lebih telus supaya gambar latar nampak) ──
    const ov = ctx.createLinearGradient(0, 0, 0, H)
    if (slotMbd) {
      ov.addColorStop(0,   `rgba(${TR},${TG},${TB},0.82)`)
      ov.addColorStop(0.25,`rgba(${TR},${TG},${TB},0.60)`)
      ov.addColorStop(0.5, `rgba(${TR},${TG},${TB},0.38)`)
      ov.addColorStop(0.75,`rgba(${TR},${TG},${TB},0.60)`)
      ov.addColorStop(1,   `rgba(${TR},${TG},${TB},0.82)`)
    } else {
      ov.addColorStop(0,   `rgba(${TR},${TG},${TB},0.90)`)
      ov.addColorStop(0.3, `rgba(${TR},${TG},${TB},0.75)`)
      ov.addColorStop(0.5, `rgba(${TR},${TG},${TB},0.60)`)
      ov.addColorStop(0.7, `rgba(${TR},${TG},${TB},0.75)`)
      ov.addColorStop(1,   `rgba(${TR},${TG},${TB},0.90)`)
    }
    ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H)

    // ── Layer 2b: Vignette sinematik ──
    const vig = ctx.createRadialGradient(CX, H * 0.52, H * 0.22, CX, H * 0.52, H * 0.82)
    vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.48)")
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)
    // ── Layer 2c: Spotlight centred on speaker photo area ──
    const spot = ctx.createRadialGradient(PX, PY, 0, PX, PY, PR + 280)
    spot.addColorStop(0, hexRgba(ACC, 0.20)); spot.addColorStop(0.55, hexRgba(ACC, 0.07)); spot.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H)

    // ── Layer 3: Islamic Girih tile pattern (full width, fades at edges) ──
    {
      const TS = 96, hS = TS / 2
      const patC = document.createElement('canvas')
      patC.width = TS; patC.height = TS
      const pc = patC.getContext('2d')
      pc.strokeStyle = ACC; pc.lineWidth = 1.5; pc.lineCap = 'round'

      // 8-pointed star at tile center
      const sR = TS * 0.295, sI = TS * 0.122
      pc.beginPath()
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI / 8) - Math.PI / 2
        const r = i % 2 === 0 ? sR : sI
        i === 0 ? pc.moveTo(hS + Math.cos(a) * r, hS + Math.sin(a) * r)
                : pc.lineTo(hS + Math.cos(a) * r, hS + Math.sin(a) * r)
      }
      pc.closePath(); pc.stroke()

      // Lines from each outer star point to tile edge midpoint (cardinal) or corner (diagonal)
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI / 4) - Math.PI / 2
        const sx = hS + Math.cos(a) * sR, sy = hS + Math.sin(a) * sR
        const dist = i % 2 === 0 ? hS : hS * Math.SQRT2
        pc.beginPath(); pc.moveTo(sx, sy)
        pc.lineTo(hS + Math.cos(a) * dist, hS + Math.sin(a) * dist); pc.stroke()
      }

      // Decorative rotated square (knot) at each edge midpoint
      const kS = TS * 0.058
      ;[[hS,0],[TS,hS],[hS,TS],[0,hS]].forEach(([ex, ey]) => {
        pc.save(); pc.translate(ex, ey); pc.rotate(Math.PI / 4)
        pc.strokeRect(-kS, -kS, kS * 2, kS * 2); pc.restore()
      })

      // Render pattern to temp canvas, then apply gradient alpha mask for edge-to-center fade
      const tmpC = document.createElement('canvas')
      tmpC.width = W; tmpC.height = H
      const tc = tmpC.getContext('2d')
      tc.fillStyle = tc.createPattern(patC, 'repeat')
      tc.fillRect(0, 0, W, H)
      const msk = tc.createLinearGradient(0, 0, W, 0)
      msk.addColorStop(0,    'rgba(0,0,0,0.22)')
      msk.addColorStop(0.28, 'rgba(0,0,0,0.06)')
      msk.addColorStop(0.72, 'rgba(0,0,0,0.06)')
      msk.addColorStop(1,    'rgba(0,0,0,0.22)')
      tc.globalCompositeOperation = 'destination-in'
      tc.fillStyle = msk; tc.fillRect(0, 0, W, H)
      ctx.drawImage(tmpC, 0, 0)
    }

    // ── Layer 4: Accent lines + frame ──
    ctx.fillStyle = GOLD
    ctx.fillRect(0, 0, W, 4); ctx.fillRect(0, H - 4, W, 4)
    ctx.strokeStyle = goldRgba(0.35); ctx.lineWidth = 1
    ctx.strokeRect(22, 22, W - 44, H - 44)

    // ── Data ──
    const BLN = ["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"]
    const iso = tarikhKeISO(slot.tarikh, bulanAktif?.bulan)
    const dt = iso ? new Date(iso + "T00:00:00") : null
    const tarikhStr = dt ? `${slot.hari||""}, ${dt.getDate()} ${BLN[dt.getMonth()]} ${dt.getFullYear()}` : (slot.tarikh || "")
    const masaStr = slotMbd?.masa || slot.masaKustom || masaWaktu[slot.waktu] || ""

    // ── Helpers ──
    const dmd = (x, y, s, al = 1) => {
      ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = GOLD
      ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-s/2, -s/2, s, s); ctx.restore()
    }
    const ornLine = (y, x1, x2) => {
      const mx = (x1 + x2) / 2
      ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = GOLD; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(mx - 14, y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(mx + 14, y); ctx.lineTo(x2, y); ctx.stroke()
      ctx.restore(); dmd(mx, y, 12)
    }
    // ── Corner medallions ──
    ;[[38, 38], [W-38, 38], [38, H-38], [W-38, H-38]].forEach(([cmx, cmy]) => {
      dmd(cmx, cmy, 12, 0.65)
      ;[[-14,0],[14,0],[0,-14],[0,14]].forEach(([dx, dy]) => dmd(cmx+dx, cmy+dy, 5, 0.65))
    })
    // Canvas-drawn UI icons — calendar, clock, location pin
    const calIcon = (cx, cy, sz) => {
      const s = sz * 0.86, hs = s / 2
      const bx = cx - hs, by = cy - hs * 0.88, bw = s, bh = s * 0.88
      ctx.fillStyle = GOLD; ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = "rgba(0,0,0,0.52)"; ctx.fillRect(bx, by, bw, bh * 0.30)
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fillRect(bx + 2, by + bh * 0.30, bw - 4, bh - bh * 0.30 - 2)
      const pg = s * 0.22
      ctx.fillStyle = GOLDL
      ctx.fillRect(cx - pg - sz * 0.055, by - sz * 0.1, sz * 0.11, sz * 0.14)
      ctx.fillRect(cx + pg - sz * 0.055, by - sz * 0.1, sz * 0.11, sz * 0.14)
      ctx.fillStyle = GOLD
      const dotY = by + bh * 0.63
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(cx + i * s * 0.24 - sz * 0.05, dotY - sz * 0.05, sz * 0.1, sz * 0.1)
      }
    }
    const clockIcon = (cx, cy, sz) => {
      const r = sz * 0.42
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = GOLD; ctx.lineWidth = sz * 0.09; ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(-Math.PI / 2 - Math.PI / 5) * r * 0.54, cy + Math.sin(-Math.PI / 2 - Math.PI / 5) * r * 0.54)
      ctx.strokeStyle = GOLD; ctx.lineWidth = sz * 0.09; ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(-Math.PI / 2 + Math.PI / 3) * r * 0.70, cy + Math.sin(-Math.PI / 2 + Math.PI / 3) * r * 0.70)
      ctx.lineWidth = sz * 0.065; ctx.stroke()
      ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(cx, cy, sz * 0.07, 0, Math.PI * 2); ctx.fill()
    }
    const pinIcon = (cx, cy, sz) => {
      const r = sz * 0.38
      const topY = cy - r * 0.5
      ctx.fillStyle = GOLD
      ctx.beginPath(); ctx.arc(cx, topY, r, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx - r * 0.5, topY + r * 0.7)
      ctx.lineTo(cx + r * 0.5, topY + r * 0.7)
      ctx.lineTo(cx, topY + r * 1.85)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = `rgba(${TR},${TG},${TB},0.88)`
      ctx.beginPath(); ctx.arc(cx, topY, r * 0.42, 0, Math.PI * 2); ctx.fill()
    }
    // Draw icon + text centred at cx using a canvas draw function for the icon
    const withIcon = (drawFn, iconSz, text, cx, y, tFont, tClr) => {
      ctx.save()
      ctx.font = tFont
      const tw = ctx.measureText(text).width
      const gap = iconSz * 0.48
      const totalW = iconSz + gap + tw
      const ix = cx - totalW / 2 + iconSz / 2
      const icY = y - iconSz * 0.30
      const tx = cx - totalW / 2 + iconSz + gap
      drawFn(ix, icY, iconSz)
      ctx.textAlign = "left"; ctx.fillStyle = tClr; ctx.font = tFont
      ctx.fillText(text, tx, y)
      ctx.restore()
    }

    // ── Portrait layout — stacked top-to-bottom (1080×1440, fits WhatsApp chat preview) ──
    const isMajlisZikir = getNamaProgram(slot) === "Majlis Zikir"
    const isMajlisBesar = !!MAJLIS_BESAR_DATA[getNamaProgram(slot)]
    const mbd = MAJLIS_BESAR_DATA[getNamaProgram(slot)]
    const photoR = isMajlisBesar ? 165 : PR
    const maxAW = W - 100
    const ayatGrad = ctx.createLinearGradient(CX - 280, 0, CX + 280, 0)
    ayatGrad.addColorStop(0, ACC); ayatGrad.addColorStop(0.5, ACL); ayatGrad.addColorStop(1, ACC)

    // ── Org header — compact so hadith gets more breathing room ──
    const LOGO_R = 32, LOGO_CY = 60
    if (logoImg) {
      ctx.save(); ctx.beginPath(); ctx.arc(CX, LOGO_CY, LOGO_R, 0, Math.PI * 2); ctx.clip()
      ctx.drawImage(logoImg, CX - LOGO_R, LOGO_CY - LOGO_R, LOGO_R * 2, LOGO_R * 2); ctx.restore()
      ctx.save(); ctx.globalAlpha = 0.65; ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(CX, LOGO_CY, LOGO_R, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
    }
    if (isMajlisBesar) {
      // Majlis besar: masjid name only — not specific to one biro
      ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.font = "700 24px Lato"; ctx.textAlign = "center"
      ctx.fillText((data?.masjid || "Masjid Parit Setongkat").toUpperCase(), CX, LOGO_CY + LOGO_R + 30)
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.82)"; ctx.font = "700 25px Lato"; ctx.textAlign = "center"
      ctx.fillText("BIRO PENDIDIKAN DAN DAKWAH", CX, LOGO_CY + LOGO_R + 24)
      ctx.fillStyle = "rgba(255,255,255,0.52)"; ctx.font = "400 17px Lato"
      ctx.fillText(data?.masjid || "Masjid Parit Setongkat", CX, LOGO_CY + LOGO_R + 44)
    }

    // ── Ayat / Hadith section ──
    const HD_TOP = LOGO_CY + LOGO_R + 112
    const maxTW = W - 80
    let sepY
    ctx.textAlign = "center"

    if (isMajlisBesar) {
      // ── Majlis Besar: Ayat Quran (single line, shrink to fit) ──
      let abf = 48; ctx.font = `400 ${abf}px Amiri`
      while (abf > 30 && ctx.measureText(mbd.ayat).width > maxAW) { abf -= 2; ctx.font = `400 ${abf}px Amiri` }
      ctx.save()
      ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.fillStyle = ayatGrad; ctx.font = `400 ${abf}px Amiri`
      ctx.fillText(mbd.ayat, CX, HD_TOP)
      ctx.restore()
      const terjemahTop = HD_TOP + abf * 0.3 + 44
      // Terjemahan — 2 balanced lines
      const tWords = mbd.terjemah.split(" ")
      let trf = 21; ctx.font = `italic 400 ${trf}px Lato`
      let tL1 = mbd.terjemah, tL2 = ""
      if (tWords.length > 2) {
        let best = { split: 1, diff: Infinity }
        for (let i = 1; i < tWords.length; i++) {
          const d = Math.abs(ctx.measureText(tWords.slice(0,i).join(" ")).width - ctx.measureText(tWords.slice(i).join(" ")).width)
          if (d < best.diff) best = { split: i, diff: d }
        }
        tL1 = tWords.slice(0, best.split).join(" ")
        tL2 = tWords.slice(best.split).join(" ")
        while (trf > 16 && (ctx.measureText(tL1).width > maxTW || ctx.measureText(tL2).width > maxTW)) {
          trf--; ctx.font = `italic 400 ${trf}px Lato`
        }
      } else {
        while (trf > 16 && ctx.measureText(tL1).width > maxTW) { trf--; ctx.font = `italic 400 ${trf}px Lato` }
      }
      ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.textAlign = "center"
      ctx.fillText(tL1, CX, terjemahTop)
      if (tL2) ctx.fillText(tL2, CX, terjemahTop + trf + 10)
      const tLastY = tL2 ? terjemahTop + trf + 10 : terjemahTop
      ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "400 16px Lato"
      ctx.fillText(`— ${mbd.src} —`, CX, tLastY + 30)
      sepY = tLastY + 56

    } else {
      // ── Kuliah biasa: Hadith ──
      const hdLineRef = "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ"
      let ahf = 46; ctx.font = `400 ${ahf}px Amiri`
      while (ahf > 30 && ctx.measureText(hdLineRef).width > maxAW) { ahf -= 2; ctx.font = `400 ${ahf}px Amiri` }
      let hdArabicBottomY
      ctx.save()
      ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.fillStyle = ayatGrad; ctx.font = `400 ${ahf}px Amiri`
      if (isMajlisZikir) {
        const hdL1 = "إِذَا مَرَرْتُمْ بِرِيَاضِ الْجَنَّةِ فَارْتَعُوا"
        const hdL2 = "قَالُوا: وَمَا رِيَاضُ الْجَنَّةِ؟ قَالَ: حِلَقُ الذِّكْرِ"
        ctx.fillText(hdL1, CX, HD_TOP); ctx.fillText(hdL2, CX, HD_TOP + ahf + 16)
        hdArabicBottomY = HD_TOP + ahf + 16
      } else {
        ctx.fillText(hdLineRef, CX, HD_TOP); hdArabicBottomY = HD_TOP
      }
      ctx.restore()
      if (isMajlisZikir) {
        const hdTransY = hdArabicBottomY + 36
        const tL1 = "\"Apabila kamu melalui taman-taman syurga, maka singgahlah.\""
        const tL2 = "Sahabat bertanya: \"Apakah taman-taman syurga itu?\""
        const tL3 = "Nabi SAW menjawab: \"Halaqah-halaqah zikir.\""
        let trf = 20; ctx.font = `italic 400 ${trf}px Lato`
        while (trf > 15 && (ctx.measureText(tL1).width > maxTW || ctx.measureText(tL2).width > maxTW || ctx.measureText(tL3).width > maxTW)) { trf--; ctx.font = `italic 400 ${trf}px Lato` }
        const tL2Y = hdTransY + trf + 10, tL3Y = hdTransY + 2*(trf + 10), srcY = tL3Y + 30
        ctx.fillStyle = "rgba(255,255,255,0.85)"
        ctx.fillText(tL1, CX, hdTransY); ctx.fillText(tL2, CX, tL2Y); ctx.fillText(tL3, CX, tL3Y)
        ctx.fillStyle = "rgba(255,255,255,0.42)"; ctx.font = "400 17px Lato"
        ctx.fillText("— Hadis Riwayat At-Tirmidzi —", CX, srcY)
        sepY = srcY + 40
      } else {
        const hdTransY = hdArabicBottomY + ahf * 0.3 + 48
        let trf = 23; ctx.font = `italic 400 ${trf}px Lato`
        const transTxt = "\"Sesiapa yang menempuh jalan menuntut ilmu, Allah mudahkan baginya jalan ke syurga.\""
        while (trf > 17 && ctx.measureText(transTxt).width > maxTW) { trf--; ctx.font = `italic 400 ${trf}px Lato` }
        ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillText(transTxt, CX, hdTransY)
        ctx.fillStyle = "rgba(255,255,255,0.42)"; ctx.font = "400 18px Lato"
        ctx.fillText("— Hadis Riwayat Muslim —", CX, hdTransY + 42)
        sepY = hdTransY + 74
      }
    }
    ctx.save(); ctx.globalAlpha = 0.38; ctx.strokeStyle = GOLD; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(CX - 200, sepY); ctx.lineTo(CX + 200, sepY); ctx.stroke(); ctx.restore()

    // ── JEMPUTAN KE ──
    const jemputanLabel = isMajlisBesar ? "JEMPUTAN KHAS KE" : isMajlisZikir ? "JEMPUTAN KE" : "JEMPUTAN KE MAJLIS ILMU"
    ctx.fillStyle = goldRgba(0.88); ctx.font = "700 30px Lato"; ctx.textAlign = "center"
    ctx.fillText(jemputanLabel, CX, sepY + 38)
    ornLine(sepY + 62, 80, W - 80)

    // ── Program name ──
    const waktuLabel = getNamaProgram(slot).toUpperCase()

    // Majlis besar: wrap into 2 balanced lines, keep font larger
    let titleLines, wf
    if (isMajlisBesar) {
      wf = 92
      const words = waktuLabel.split(" ")
      let best = { split: 1, diff: Infinity }
      ctx.font = `900 ${wf}px 'Playfair Display'`
      for (let i = 1; i < words.length; i++) {
        const d = Math.abs(ctx.measureText(words.slice(0,i).join(" ")).width - ctx.measureText(words.slice(i).join(" ")).width)
        if (d < best.diff) best = { split: i, diff: d }
      }
      titleLines = words.length > 1
        ? [words.slice(0, best.split).join(" "), words.slice(best.split).join(" ")]
        : [waktuLabel]
      while (titleLines.some(l => ctx.measureText(l).width > W - 60) && wf > 54) { wf -= 4; ctx.font = `900 ${wf}px 'Playfair Display'` }
    } else {
      wf = 104; ctx.font = `900 ${wf}px 'Playfair Display'`
      while (ctx.measureText(waktuLabel).width > W - 60 && wf > 62) { wf -= 4; ctx.font = `900 ${wf}px 'Playfair Display'` }
      titleLines = [waktuLabel]
    }

    const wGrad = ctx.createLinearGradient(CX - 380, 0, CX + 380, 0)
    wGrad.addColorStop(0, ACC); wGrad.addColorStop(0.5, ACL); wGrad.addColorStop(1, ACC)
    ctx.textAlign = "center"
    const titleLineH = wf + 10
    const titleY = Math.round(sepY + 62 + 28 + wf * 0.85)
    const lastTitleY = titleY + (titleLines.length - 1) * titleLineH

    ctx.save()
    // Majlis besar: deep layered shadow only — no background band
    ctx.shadowColor = "rgba(0,0,0,1)"
    ctx.shadowBlur = isMajlisBesar ? 55 : 20
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = isMajlisBesar ? 8 : 5
    ctx.fillStyle = wGrad
    if (isMajlisBesar) {
      // Draw 3× to stack shadow opacity for legibility without background
      for (let pass = 0; pass < 3; pass++)
        titleLines.forEach((ln, i) => ctx.fillText(ln, CX, titleY + i * titleLineH))
    } else {
      titleLines.forEach((ln, i) => ctx.fillText(ln, CX, titleY + i * titleLineH))
    }
    ctx.restore()
    ctx.lineWidth = isMajlisBesar ? 2.5 : 1.4; ctx.strokeStyle = hexRgba(ACC, 0.45)
    titleLines.forEach((ln, i) => ctx.strokeText(ln, CX, titleY + i * titleLineH))
    const ulW = Math.max(...titleLines.map(l => ctx.measureText(l).width)) + 28
    ctx.fillStyle = hexRgba(ACC, 0.35); ctx.fillRect(CX - ulW / 2, lastTitleY + 13, ulW, 6)

    const orn1Y = lastTitleY + 44
    ornLine(orn1Y, 48, W - 48)

    // ── Topic / Pengisian ──
    const LABEL_GENERIK = ["umum", "am", "tiada", "-", "–"]
    let topicLines = [], tf = 58
    const slotPengisian = getPengisian(slot)
    const sepIdx = slotPengisian ? slotPengisian.indexOf(" – ") : -1
    const rawTopik = slotPengisian ? (sepIdx >= 0 ? slotPengisian.slice(0, sepIdx) : slotPengisian) : ""
    const topikStr = LABEL_GENERIK.includes(rawTopik.trim().toLowerCase()) ? "" : rawTopik
    const kitabStr = slotPengisian && sepIdx >= 0 ? slotPengisian.slice(sepIdx + 3) : ""
    const maxTopikW = W - 80
    if (topikStr) {
      const buildTopikLines = () => {
        ctx.font = `italic 700 ${tf}px 'Playfair Display'`
        let line = "", lines = []
        for (const w of topikStr.split(" ")) {
          const test = line ? line + " " + w : w
          if (ctx.measureText(test).width > maxTopikW) { lines.push(line); line = w } else line = test
        }
        if (line) lines.push(line)
        return lines.slice(0, 2)
      }
      topicLines = buildTopikLines()
      while (tf > 36) {
        ctx.font = `italic 700 ${tf}px 'Playfair Display'`
        if (!topicLines.some(l => ctx.measureText(l).width > maxTopikW)) break
        tf -= 4; topicLines = buildTopikLines()
      }
    }
    const hasKitab = kitabStr.length > 0
    let kf = 36
    if (hasKitab) {
      ctx.font = `italic 400 ${kf}px Lato`
      while (ctx.measureText(kitabStr).width > maxTopikW && kf > 26) { kf -= 2; ctx.font = `italic 400 ${kf}px Lato` }
    }
    // Majlis besar needs extra room so "— TAJUK —" label clears the ornament line
    const mbGap = isMajlisBesar ? 52 : 0
    const orn2Y = topicLines.length === 0 ? orn1Y + 54
                : topicLines.length === 1 && !hasKitab ? orn1Y + 92 + mbGap
                : topicLines.length === 1 ?  orn1Y + 130 + mbGap
                : !hasKitab ?                orn1Y + 115 + mbGap
                :                            orn1Y + 162 + mbGap
    if (topicLines.length > 0 && !isMajlisBesar) {
      const lineGap = tf + 10
      const kitabGap = hasKitab ? kf + 14 : 0
      const topikSpan = (topicLines.length - 1) * lineGap
      const totalH = topikSpan + tf + kitabGap
      const ty0 = Math.round((orn1Y + orn2Y) / 2 - totalH / 2 + tf * 0.82)

      // Majlis besar: "TAJUK" label above topic — large gold, clearly visible
      if (isMajlisBesar) {
        ctx.save()
        ctx.shadowColor = "rgba(0,0,0,1)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 3
        ctx.fillStyle = goldRgba(0.98); ctx.font = "700 28px Lato"; ctx.textAlign = "center"
        ctx.fillText("— T A J U K —", CX, ty0 - tf - 16)
        ctx.restore()
      }
      ctx.shadowColor = "rgba(0,0,0,0.95)"; ctx.shadowBlur = isMajlisBesar ? 40 : 12
      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = isMajlisBesar ? 6 : 2
      ctx.fillStyle = "rgba(255,255,255,0.97)"; ctx.textAlign = "center"
      if (isMajlisBesar) {
        for (let pass = 0; pass < 3; pass++)
          topicLines.forEach((ln, i) => { ctx.font = `italic 700 ${tf}px 'Playfair Display'`; ctx.fillText(ln, CX, ty0 + i * lineGap) })
      } else {
        topicLines.forEach((ln, i) => { ctx.font = `italic 700 ${tf}px 'Playfair Display'`; ctx.fillText(ln, CX, ty0 + i * lineGap) })
      }
      if (hasKitab) {
        ctx.font = `italic 400 ${kf}px Lato`; ctx.fillStyle = goldRgba(0.92)
        ctx.fillText(kitabStr, CX, ty0 + topikSpan + kitabGap)
      }
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0
    }
    if ((topicLines.length > 0 || hasKitab) && !isMajlisBesar) ornLine(orn2Y, 84, W - 84)

    // ── Speaker photo + name + event details ──
    const prefix = (slot.penceramah || "").includes("Ustazah") ? "Al-Fadhilah" : "Al-Fadhil"

    if (isMajlisBesar) {
      // ── Majlis Besar: 2-column — left=photo+name, right=tajuk+event ──
      const LCX = Math.round(W / 4)          // 270
      const RCX = Math.round(3 * W / 4) - 8  // 802 — nudged left so right text keeps an edge margin
      const colTop = orn1Y + 24

      // ── LEFT: bingkai memanjang + speaker name ──
      const frameW = 400
      const frameH = 500
      const frameX = LCX - Math.round(frameW / 2)
      const frameY = colTop
      const frameRadius = 12

      if (speakerImg) {
        ctx.save()
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(frameX, frameY, frameW, frameH, frameRadius)
        else ctx.rect(frameX, frameY, frameW, frameH)
        ctx.clip()
        const natAspect = speakerImg.naturalHeight / speakerImg.naturalWidth
        const frmAspect = frameH / frameW
        let pdw, pdh, pdx, pdy
        if (natAspect > frmAspect) {
          pdw = frameW; pdh = pdw * natAspect; pdx = frameX; pdy = frameY
        } else {
          pdh = frameH; pdw = pdh / natAspect; pdx = frameX + (frameW - pdw) / 2; pdy = frameY
        }
        ctx.drawImage(speakerImg, pdx, pdy, pdw, pdh)
        ctx.restore()
        ctx.save()
        ctx.strokeStyle = ACC; ctx.lineWidth = 2.5
        ctx.shadowColor = ACC; ctx.shadowBlur = 18
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(frameX, frameY, frameW, frameH, frameRadius)
        else ctx.rect(frameX, frameY, frameW, frameH)
        ctx.stroke(); ctx.restore()
        ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = GOLD; ctx.lineWidth = 1
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(frameX - 6, frameY - 6, frameW + 12, frameH + 12, frameRadius + 4)
        else ctx.rect(frameX - 6, frameY - 6, frameW + 12, frameH + 12)
        ctx.stroke(); ctx.restore()
      } else {
        ctx.fillStyle = hexRgba(ACC, 0.10)
        ctx.beginPath(); ctx.arc(LCX, frameY + frameH / 2, Math.min(frameW, frameH) / 2, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = hexRgba(ACC, 0.45); ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(LCX, frameY + frameH / 2, Math.min(frameW, frameH) / 2, 0, Math.PI * 2); ctx.stroke()
      }
      const photoBottomY = frameY + frameH

      // Label "PENCERAMAH JEMPUTAN" + speaker name below photo
      const maxSideNameW = frameW + 10
      const labelY = photoBottomY + 30
      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2
      ctx.fillStyle = goldRgba(0.95); ctx.font = "700 22px Lato"; ctx.textAlign = "center"
      ctx.fillText("PENCERAMAH JEMPUTAN", LCX, labelY)
      ctx.restore()
      ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = GOLD; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(LCX - 72, labelY + 12); ctx.lineTo(LCX + 72, labelY + 12); ctx.stroke(); ctx.restore()

      // Gelaran "Al-Fadhil" in front of the name — wrap to at most 2 lines
      const fullName = `${prefix} ${slot.penceramah || ""}`.trim()
      let snf = 36
      const wrapName = () => {
        ctx.font = `700 ${snf}px 'Playfair Display'`
        let line = "", lines = []
        for (const w of fullName.split(" ")) {
          const t = line ? line + " " + w : w
          if (ctx.measureText(t).width > maxSideNameW) { lines.push(line); line = w } else line = t
        }
        if (line) lines.push(line)
        return lines
      }
      let nameLines = wrapName()
      while ((nameLines.length > 2 || nameLines.some(l => ctx.measureText(l).width > maxSideNameW)) && snf > 20) { snf -= 2; nameLines = wrapName() }
      let snY = labelY + 32 + snf
      nameLines.forEach((ln, i) => {
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2
        ctx.fillStyle = "#ffffff"; ctx.font = `700 ${snf}px 'Playfair Display'`; ctx.textAlign = "center"
        ctx.fillText(ln, LCX, snY + i * (snf + 6)); ctx.restore()
      })
      snY = snY + (nameLines.length - 1) * (snf + 6)

      // Vertical gold divider between columns
      const divBot = snY + 22
      ctx.save(); ctx.globalAlpha = 0.38; ctx.strokeStyle = GOLD; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(CX, colTop); ctx.lineTo(CX, divBot); ctx.stroke(); ctx.restore()
      dmd(CX, colTop, 8, 0.55)
      dmd(CX, divBot, 8, 0.55)

      // ── RIGHT: TAJUK label + topic + event details ──
      const rightTop = colTop + 14

      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,1)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 3
      ctx.fillStyle = goldRgba(0.98); ctx.font = "700 26px Lato"; ctx.textAlign = "center"
      ctx.fillText("— T A J U K —", RCX, rightTop + 22)
      ctx.restore()

      // Topic lines — re-wrap for narrower right column
      const maxRTopW = W / 2 - 76
      let rtf = 48
      let rTopLines = []
      if (topikStr) {
        const buildRL = () => {
          ctx.font = `italic 700 ${rtf}px 'Playfair Display'`
          let rl = "", rll = []
          for (const w of topikStr.split(" ")) {
            const t2 = rl ? rl + " " + w : w
            if (ctx.measureText(t2).width > maxRTopW) { rll.push(rl); rl = w } else rl = t2
          }
          if (rl) rll.push(rl)
          return rll.slice(0, 3)
        }
        rTopLines = buildRL()
        while (rtf > 28 && rTopLines.some(l => ctx.measureText(l).width > maxRTopW)) { rtf -= 4; rTopLines = buildRL() }
      }
      let rkf = Math.min(kf, 30)
      if (hasKitab) {
        ctx.font = `italic 400 ${rkf}px Lato`
        while (ctx.measureText(kitabStr).width > maxRTopW && rkf > 18) { rkf -= 2; ctx.font = `italic 400 ${rkf}px Lato` }
      }

      let rtY = rightTop + 22 + 28
      if (rTopLines.length > 0) {
        const rGap = rtf + 10
        ctx.save()
        ctx.shadowColor = "rgba(0,0,0,0.95)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 5
        ctx.fillStyle = "rgba(255,255,255,0.97)"; ctx.textAlign = "center"
        for (let pass = 0; pass < 3; pass++)
          rTopLines.forEach((ln, i) => { ctx.font = `italic 700 ${rtf}px 'Playfair Display'`; ctx.fillText(ln, RCX, rtY + rtf + i * rGap) })
        ctx.restore()
        ctx.lineWidth = 2.0; ctx.strokeStyle = hexRgba(ACC, 0.45)
        rTopLines.forEach((ln, i) => { ctx.font = `italic 700 ${rtf}px 'Playfair Display'`; ctx.strokeText(ln, RCX, rtY + rtf + i * rGap) })
        if (hasKitab) {
          const kitabY = rtY + rtf + (rTopLines.length - 1) * rGap + rkf + 12
          ctx.font = `italic 400 ${rkf}px Lato`; ctx.fillStyle = goldRgba(0.92); ctx.textAlign = "center"
          ctx.fillText(kitabStr, RCX, kitabY)
          rtY = kitabY
        } else {
          rtY = rtY + rtf + (rTopLines.length - 1) * rGap
        }
      } else if (hasKitab) {
        ctx.font = `italic 400 ${rkf}px Lato`; ctx.fillStyle = goldRgba(0.92); ctx.textAlign = "center"
        ctx.fillText(kitabStr, RCX, rtY + rkf)
        rtY = rtY + rkf
      }

      // Thin ornament line (right side only)
      const rightOrnY = rtY + 40
      ornLine(rightOrnY, CX + 20, W - 44)

      // ── Event details — tarikh / masa / lokasi ──
      const rPanelW = W / 2 - 24
      const rPanelX = RCX - rPanelW / 2
      const evGap = 66                  // tighter spacing between rows
      const evStartY = rightOrnY + 58   // push tarikh clear of the ornament line

      // Masa — wrap to 2 balanced lines if the text is long
      const masaFont = mbd?.masa ? "400 32px Lato" : "400 34px Lato"
      const masaMaxW = rPanelW - 150
      ctx.font = masaFont
      let masaLines = [masaStr]
      if (ctx.measureText(masaStr).width > masaMaxW) {
        const mw = masaStr.split(" ")
        let best = { split: 1, diff: Infinity }
        for (let i = 1; i < mw.length; i++) {
          const a = ctx.measureText(mw.slice(0, i).join(" ")).width
          const b = ctx.measureText(mw.slice(i).join(" ")).width
          if (Math.max(a, b) <= masaMaxW && Math.abs(a - b) < best.diff) best = { split: i, diff: Math.abs(a - b) }
        }
        if (best.diff < Infinity) masaLines = [mw.slice(0, best.split).join(" "), mw.slice(best.split).join(" ")]
      }
      const masaLineH = 40
      const masaExtra = masaLines.length > 1 ? masaLineH : 0

      // Row baselines — bring the three details closer together
      const adaTasbih = !!slot.solatTasbih
      const tarikhY = evStartY
      const masaY   = tarikhY + evGap
      const tasbihY = masaY + masaExtra + evGap
      const lokasiY = adaTasbih ? tasbihY + evGap : masaY + masaExtra + evGap
      const lastEvY = lokasiY

      // Dark gradient panel sized to actual content
      const evPanelTop = tarikhY - 46
      const evPanelH = (lokasiY + 26) - evPanelTop
      const rPanelGrad = ctx.createLinearGradient(rPanelX, 0, rPanelX + rPanelW, 0)
      rPanelGrad.addColorStop(0,    'rgba(0,0,0,0)')
      rPanelGrad.addColorStop(0.14, 'rgba(0,0,0,0.75)')
      rPanelGrad.addColorStop(0.86, 'rgba(0,0,0,0.75)')
      rPanelGrad.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.save(); ctx.fillStyle = rPanelGrad; ctx.fillRect(rPanelX, evPanelTop, rPanelW, evPanelH); ctx.restore()

      // Helper: icon + (possibly 2-line) text, centred at cx
      const iconTextRows = (drawFn, iconSz, lines, cx, yTop, font, clr, lineH) => {
        ctx.save(); ctx.font = font
        const maxLineW = Math.max(...lines.map(l => ctx.measureText(l).width))
        const gap = iconSz * 0.48
        const totalW = iconSz + gap + maxLineW
        const startX = cx - totalW / 2
        const blockH = (lines.length - 1) * lineH
        drawFn(startX + iconSz / 2, yTop + blockH / 2 - iconSz * 0.30, iconSz)
        ctx.textAlign = "left"; ctx.fillStyle = clr; ctx.font = font
        lines.forEach((ln, i) => ctx.fillText(ln, startX + iconSz + gap, yTop + i * lineH))
        ctx.restore()
      }

      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.95)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3
      withIcon(calIcon, 46, tarikhStr, RCX, tarikhY, "700 42px 'Playfair Display'", "#ffffff")
      if (masaLines.length > 1) iconTextRows(clockIcon, 35, masaLines, RCX, masaY, masaFont, "rgba(255,255,255,0.88)", masaLineH)
      else withIcon(clockIcon, 35, masaLines[0], RCX, masaY, masaFont, "rgba(255,255,255,0.88)")
      if (adaTasbih) {
        ctx.fillStyle = goldRgba(0.92); ctx.font = "italic 700 24px Lato"; ctx.textAlign = "center"
        ctx.fillText("✦ Didahului Solat Sunat Tasbih ✦", RCX, tasbihY)
      }
      withIcon(pinIcon, 32, data?.masjid || "Masjid Parit Setongkat", RCX, lokasiY, "700 32px Lato", goldRgba(0.98))
      ctx.restore()

      // Invitation pill — fills the space below the info panel
      const inviteTxt = "Muslimin dan Muslimat dijemput hadir"
      ctx.font = "italic 400 24px Lato"
      const ipillW = ctx.measureText(inviteTxt).width + 56
      const ipillH = 54
      const ipillX = RCX - ipillW / 2
      const inviteCenterY = lokasiY + 64
      const ipillY = inviteCenterY - ipillH / 2
      ctx.save()
      ctx.fillStyle = "rgba(0,0,0,0.42)"
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(ipillX, ipillY, ipillW, ipillH, ipillH / 2); ctx.fill() }
      else ctx.fillRect(ipillX, ipillY, ipillW, ipillH)
      ctx.strokeStyle = goldRgba(0.55); ctx.lineWidth = 1.5
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(ipillX, ipillY, ipillW, ipillH, ipillH / 2); ctx.stroke() }
      else ctx.strokeRect(ipillX, ipillY, ipillW, ipillH)
      ctx.restore()
      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2
      ctx.fillStyle = goldRgba(0.96); ctx.font = "italic 400 24px Lato"; ctx.textAlign = "center"
      ctx.fillText(inviteTxt, RCX, inviteCenterY + 8)
      ctx.restore()

      // Bottom ornament
      const inviteBottom = ipillY + ipillH
      const bottomOrnY = Math.min(Math.max(inviteBottom + 40, H - 100), H - 52)
      ornLine(bottomOrnY, 80, W - 80)

    } else {
      // ── Regular layout: centred photo → name → event details ──
      const PY_photo = orn2Y + 42 + photoR + 10
      if (speakerImg) {
        ctx.save()
        ctx.shadowColor = ACC; ctx.shadowBlur = 28
        ctx.strokeStyle = ACC; ctx.lineWidth = 3
        ctx.beginPath(); ctx.arc(CX, PY_photo, photoR + 6, 0, Math.PI * 2); ctx.stroke()
        ctx.restore()
        ctx.strokeStyle = hexRgba(ACC, 0.22); ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(CX, PY_photo, photoR + 18, 0, Math.PI * 2); ctx.stroke()
        ctx.save()
        ctx.beginPath(); ctx.arc(CX, PY_photo, photoR, 0, Math.PI * 2); ctx.clip()
        const imgA = speakerImg.naturalWidth / speakerImg.naturalHeight
        let pdw, pdh
        if (imgA > 1) { pdh = photoR * 2; pdw = pdh * imgA } else { pdw = photoR * 2; pdh = pdw / imgA }
        ctx.drawImage(speakerImg, CX - pdw / 2, PY_photo - pdh / 2, pdw, pdh)
        ctx.restore()
      } else {
        ctx.fillStyle = hexRgba(ACC, 0.1)
        ctx.beginPath(); ctx.arc(CX, PY_photo, photoR, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = ACC; ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(CX, PY_photo, photoR, 0, Math.PI * 2); ctx.stroke()
      }

      const nameTop = PY_photo + photoR + 42
      ctx.fillStyle = goldRgba(0.9); ctx.font = "italic 400 33px Lato"; ctx.textAlign = "center"
      ctx.fillText(prefix, CX, nameTop)
      const nameMaxW = W - 80
      let nf = 48; ctx.font = `700 ${nf}px 'Playfair Display'`
      while (ctx.measureText(slot.penceramah || "").width > nameMaxW && nf > 30) { nf -= 3; ctx.font = `700 ${nf}px 'Playfair Display'` }
      const nWords = (slot.penceramah || "").split(" ")
      let nLine = "", nY = nameTop + nf + 12
      for (const w of nWords) {
        const t = nLine ? nLine + " " + w : w
        if (ctx.measureText(t).width > nameMaxW) {
          ctx.fillStyle = "#ffffff"; ctx.fillText(nLine, CX, nY); nLine = w; nY += nf + 8
        } else nLine = t
      }
      if (nLine) { ctx.fillStyle = "#ffffff"; ctx.font = `700 ${nf}px 'Playfair Display'`; ctx.fillText(nLine, CX, nY) }

      const detailsTopY = nY + 42
      const adaTasbih = !!slot.solatTasbih
      ornLine(detailsTopY, 80, W - 80)
      withIcon(calIcon, 46, tarikhStr, CX, detailsTopY + 58, "700 44px 'Playfair Display'", "#ffffff")
      withIcon(clockIcon, 33, masaStr, CX, detailsTopY + 102, "300 36px Lato", "rgba(255,255,255,0.80)")
      if (adaTasbih) {
        ctx.save()
        ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2
        ctx.fillStyle = goldRgba(0.92); ctx.font = "italic 700 26px Lato"; ctx.textAlign = "center"
        ctx.fillText("✦ Didahului Solat Sunat Tasbih ✦", CX, detailsTopY + 138)
        ctx.restore()
      }
      withIcon(pinIcon, 31, data?.masjid || "Masjid Parit Setongkat", CX, detailsTopY + (adaTasbih ? 174 : 138), "italic 700 34px Lato", goldRgba(0.96))

      const bottomOrnY = Math.min(Math.max(detailsTopY + (adaTasbih ? 206 : 170), H - 100), H - 52)
      ornLine(bottomOrnY, 80, W - 80)
      ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.font = "italic 400 18px Lato"; ctx.textAlign = "center"
      ctx.fillText("*Tertakluk kepada perubahan tanpa notis awal", CX, bottomOrnY + 38)
    }

    // ── Preview (bukan terus muat turun) ──
    const namaProgram = getNamaProgram(slot)
    const penceramahNama = slot.penceramah || ""
    const BNAM_FN = ["","Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"]
    const [fnY, fnM] = (bulanAktif?.bulan || "").split("-")
    const bulanLabelFn = `${BNAM_FN[parseInt(fnM)] || ""} ${fnY || ""}`.trim()
    const filename = `${namaProgram} (${slot.hari || ""}, Minggu ${mingguKe}) - ${penceramahNama}${bulanLabelFn ? ` - ${bulanLabelFn}` : ""}.png`.replace(/\s+/g, " ").trim()
    setPratontonPoster({ dataUrl: canvas.toDataURL("image/png"), filename })
  }

  async function janaKadPenceramah(namaPenceramah) {
    const semSlot = (data?.minggu || [])
      .flatMap(mg => mg.slots || [])
      .filter(s => s.penceramah === namaPenceramah && !s.ditangguhJadual && !s.kewanganSahaja)
      .sort((a, b) => tarikhKeISO(a.tarikh, bulanAktif?.bulan).localeCompare(tarikhKeISO(b.tarikh, bulanAktif?.bulan)))
    if (!semSlot.length) return

    const pObj = semPenceramah.find(p => p.nama === namaPenceramah)
    const gambarUrl = pObj?.gambar_url

    await Promise.allSettled([
      document.fonts.load("900 16px 'Playfair Display'"),
      document.fonts.load("700 16px Lato"),
      document.fonts.load("400 16px Lato"),
    ])
    const loadImg = url => new Promise(res => {
      const img = new Image(); img.crossOrigin = "anonymous"
      img.onload = () => res(img); img.onerror = () => res(null); img.src = url
    })
    const [photoImg, logoImg, masjidImg] = await Promise.all([
      gambarUrl ? loadImg(gambarUrl) : Promise.resolve(null),
      loadImg(window.location.origin + "/logo-masjid.jpg"),
      loadImg(window.location.origin + "/masjid-bg.jpg"),
    ])

    // ── Layout constants ──
    const CW = 1080
    const GOLD = "#c9a227"; const GOLDL = "#fcd34d"
    const goldRgba = a => `rgba(201,162,39,${a})`
    // Random card theme — varies each time button is clicked
    const CARD_THEMES = [
      { TR:28, TG:14, TB:2,  acc:"#d97706", aR:217, aG:119, aB:6   }, // Emas/Amber
      { TR:4,  TG:20, TB:10, acc:"#059669", aR:5,   aG:150, aB:105 }, // Zamrud/Emerald
      { TR:4,  TG:10, TB:30, acc:"#1d4ed8", aR:29,  aG:78,  aB:216 }, // Nilam/Blue
      { TR:24, TG:4,  TB:4,  acc:"#b91c1c", aR:185, aG:28,  aB:28  }, // Delima/Red
      { TR:2,  TG:16, TB:20, acc:"#0e7490", aR:14,  aG:116, aB:144 }, // Langit/Teal
      { TR:20, TG:6,  TB:2,  acc:"#b45309", aR:180, aG:83,  aB:9   }, // Coklat/Bronze
    ]
    const ct = CARD_THEMES[Math.floor(Math.random() * CARD_THEMES.length)]
    const TR = ct.TR, TG = ct.TG, TB = ct.TB
    const acRgba = a => `rgba(${ct.aR},${ct.aG},${ct.aB},${a})`

    // Grid layout
    const COLS = semSlot.length <= 4 ? 2 : 3
    const PAD = 30, GAP = 14
    const cardW = Math.floor((CW - PAD * 2 - GAP * (COLS - 1)) / COLS)
    const cardH = 212
    const ROWS = Math.ceil(semSlot.length / COLS)
    const gridH = ROWS * cardH + Math.max(0, ROWS - 1) * GAP

    const logoY = 58, logoR = 42
    const orn1Y = logoY + logoR + 66
    const photoR = 145, photoX = CW / 2, photoY = orn1Y + 20 + photoR
    const orn2Y = photoY + photoR + 124
    const schY  = photoY + photoR + 160
    const orn3Y = schY + 72
    const rowStartY = schY + 90
    const CH = rowStartY + gridH + 90

    const canvas = document.createElement("canvas")
    canvas.width = CW; canvas.height = CH
    const ctx = canvas.getContext("2d")

    // ── Layer 1: Mosque photo background (blurred, cover-fill) ──
    if (masjidImg) {
      ctx.filter = "blur(7px)"
      const imgA = masjidImg.naturalWidth / masjidImg.naturalHeight
      const canA = CW / CH
      let dw, dh, dx = 0, dy = 0
      if (imgA > canA) { dh = CH + 14; dw = dh * imgA; dx = (CW - dw) / 2 }
      else             { dw = CW + 14; dh = dw / imgA; dy = (CH - dh) / 2 }
      ctx.drawImage(masjidImg, dx, dy, dw, dh)
      ctx.filter = "none"
    } else {
      const bg = ctx.createLinearGradient(0, 0, 0, CH)
      bg.addColorStop(0, `rgb(${TR},${TG},${TB})`); bg.addColorStop(1, "rgb(6,4,16)")
      ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH)
    }

    // ── Layer 2: Dark overlay ──
    const ov = ctx.createLinearGradient(0, 0, 0, CH)
    ov.addColorStop(0,   `rgba(${TR},${TG},${TB},0.86)`)
    ov.addColorStop(0.45,`rgba(${TR},${TG},${TB},0.82)`)
    ov.addColorStop(1,   `rgba(${TR},${TG},${TB},0.91)`)
    ctx.fillStyle = ov; ctx.fillRect(0, 0, CW, CH)

    // ── Layer 3: Islamic Girih tile pattern (full-width, fades at edges) ──
    {
      const TS = 96, hS = TS / 2
      const patC = document.createElement('canvas')
      patC.width = TS; patC.height = TS
      const pc = patC.getContext('2d')
      pc.strokeStyle = GOLD; pc.lineWidth = 1.2; pc.lineCap = 'round'
      const sR = TS * 0.295, sI = TS * 0.122
      pc.beginPath()
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI / 8) - Math.PI / 2
        const r = i % 2 === 0 ? sR : sI
        i === 0 ? pc.moveTo(hS + Math.cos(a) * r, hS + Math.sin(a) * r)
                : pc.lineTo(hS + Math.cos(a) * r, hS + Math.sin(a) * r)
      }
      pc.closePath(); pc.stroke()
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI / 4) - Math.PI / 2
        const sx = hS + Math.cos(a) * sR, sy = hS + Math.sin(a) * sR
        const dist = i % 2 === 0 ? hS : hS * Math.SQRT2
        pc.beginPath(); pc.moveTo(sx, sy); pc.lineTo(hS + Math.cos(a) * dist, hS + Math.sin(a) * dist); pc.stroke()
      }
      const kS = TS * 0.058
      ;[[hS,0],[TS,hS],[hS,TS],[0,hS]].forEach(([ex,ey]) => {
        pc.save(); pc.translate(ex,ey); pc.rotate(Math.PI/4); pc.strokeRect(-kS,-kS,kS*2,kS*2); pc.restore()
      })
      const tmpC = document.createElement('canvas')
      tmpC.width = CW; tmpC.height = CH
      const tc = tmpC.getContext('2d')
      tc.fillStyle = tc.createPattern(patC, 'repeat'); tc.fillRect(0, 0, CW, CH)
      const msk = tc.createLinearGradient(0, 0, CW, 0)
      msk.addColorStop(0,    'rgba(0,0,0,0.24)')
      msk.addColorStop(0.35, 'rgba(0,0,0,0.09)')
      msk.addColorStop(0.65, 'rgba(0,0,0,0.09)')
      msk.addColorStop(1,    'rgba(0,0,0,0.24)')
      tc.globalCompositeOperation = 'destination-in'
      tc.fillStyle = msk; tc.fillRect(0, 0, CW, CH)
      ctx.drawImage(tmpC, 0, 0)
    }

    // ── Layer 4: Gold frame ──
    ctx.fillStyle = GOLD
    ctx.fillRect(0, 0, CW, 4); ctx.fillRect(0, CH - 4, CW, 4)
    ctx.save(); ctx.strokeStyle = goldRgba(0.32); ctx.lineWidth = 1
    ctx.strokeRect(18, 18, CW - 36, CH - 36); ctx.restore()

    // ── Helpers ──
    function ornLine(y, x1 = 80, x2 = CW - 80) {
      ctx.save()
      const lg = ctx.createLinearGradient(x1, 0, x2, 0)
      lg.addColorStop(0, "rgba(201,162,39,0)")
      lg.addColorStop(0.3, "rgba(201,162,39,0.65)")
      lg.addColorStop(0.7, "rgba(201,162,39,0.65)")
      lg.addColorStop(1, "rgba(201,162,39,0)")
      ctx.strokeStyle = lg; ctx.lineWidth = 1; ctx.globalAlpha = 0.75
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke()
      ctx.globalAlpha = 0.55; ctx.fillStyle = GOLD
      ctx.save(); ctx.translate(CW / 2, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-4, -4, 8, 8); ctx.restore()
      ctx.restore()
    }
    function rrect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
    }

    // ── Top accent bar ──
    const topG = ctx.createLinearGradient(0, 0, CW, 0)
    topG.addColorStop(0, "rgba(201,162,39,0)"); topG.addColorStop(0.5, "rgba(201,162,39,0.38)"); topG.addColorStop(1, "rgba(201,162,39,0)")
    ctx.fillStyle = topG; ctx.fillRect(0, 0, CW, 5)

    // ── Logo + Biro header ──
    if (logoImg) {
      ctx.save(); ctx.beginPath(); ctx.arc(CW / 2, logoY, logoR, 0, Math.PI * 2); ctx.clip()
      ctx.drawImage(logoImg, CW / 2 - logoR, logoY - logoR, logoR * 2, logoR * 2); ctx.restore()
      ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = GOLD; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(CW / 2, logoY, logoR + 2, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
    }
    ctx.fillStyle = "rgba(255,255,255,0.90)"; ctx.font = "700 26px Lato"; ctx.textAlign = "center"
    ctx.fillText("BIRO PENDIDIKAN DAN DAKWAH", CW / 2, logoY + logoR + 36)
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "400 18px Lato"
    ctx.fillText(data?.masjid || "Masjid Parit Setongkat", CW / 2, logoY + logoR + 61)
    ornLine(orn1Y)

    // ── Speaker photo ──
    const glowG = ctx.createRadialGradient(photoX, photoY, photoR - 15, photoX, photoY, photoR + 55)
    glowG.addColorStop(0, acRgba(0.30)); glowG.addColorStop(1, acRgba(0))
    ctx.fillStyle = glowG; ctx.beginPath(); ctx.arc(photoX, photoY, photoR + 55, 0, Math.PI * 2); ctx.fill()

    ctx.save(); ctx.beginPath(); ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2); ctx.clip()
    if (photoImg) {
      ctx.drawImage(photoImg, photoX - photoR, photoY - photoR, photoR * 2, photoR * 2)
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fillRect(photoX - photoR, photoY - photoR, photoR * 2, photoR * 2)
      const initials = namaPenceramah.split(" ").slice(0, 2).map(w => w[0]).join("")
      ctx.fillStyle = goldRgba(0.45); ctx.font = "700 84px Lato"; ctx.textAlign = "center"
      ctx.fillText(initials.toUpperCase(), photoX, photoY + 28)
    }
    ctx.restore()

    ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3.5; ctx.globalAlpha = 0.82
    ctx.beginPath(); ctx.arc(photoX, photoY, photoR + 6, 0, Math.PI * 2); ctx.stroke()
    ctx.globalAlpha = 0.22; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(photoX, photoY, photoR + 18, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()

    // ── Speaker name ──
    const prefix = namaPenceramah.includes("Ustazah") ? "Al-Fadhilah" : "Al-Fadhil"
    ctx.fillStyle = goldRgba(0.82); ctx.font = "italic 400 26px Lato"; ctx.textAlign = "center"
    ctx.fillText(prefix, CW / 2, photoY + photoR + 40)

    let nf = 50; ctx.font = `700 ${nf}px 'Playfair Display'`
    while (ctx.measureText(namaPenceramah).width > CW - 80 && nf > 30) { nf -= 2; ctx.font = `700 ${nf}px 'Playfair Display'` }
    const nameG = ctx.createLinearGradient(CW / 2 - 320, 0, CW / 2 + 320, 0)
    nameG.addColorStop(0, GOLD); nameG.addColorStop(0.5, GOLDL); nameG.addColorStop(1, GOLD)
    ctx.fillStyle = nameG; ctx.textAlign = "center"
    ctx.fillText(namaPenceramah, CW / 2, photoY + photoR + 92)
    const ulW = ctx.measureText(namaPenceramah).width + 32
    ctx.fillStyle = goldRgba(0.20); ctx.fillRect(CW / 2 - ulW / 2, photoY + photoR + 102, ulW, 5)
    ornLine(orn2Y)

    // ── Schedule header ──
    const KULIAH_PROGS = ["Kuliah Subuh","Kuliah Duha","Kuliah Asar","Kuliah Maghrib","Kuliah Isyak","Tazkirah Jumaat","Pengajian Am"]
    const firstProg = getNamaProgram(semSlot[0])
    const takwimLabel = KULIAH_PROGS.includes(firstProg) ? "TAKWIM KULIAH" : `TAKWIM ${firstProg.toUpperCase()}`
    ctx.fillStyle = goldRgba(0.95); ctx.font = "700 36px Lato"; ctx.textAlign = "center"
    ctx.fillText(takwimLabel, CW / 2, schY)
    const [tY, tM] = (bulanAktif?.bulan || "").split("-")
    const BNAM = ["","Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"]
    ctx.fillStyle = "rgba(255,255,255,0.72)"; ctx.font = "400 31px Lato"
    ctx.fillText(`${BNAM[parseInt(tM)] || ""} ${tY || ""}`, CW / 2, schY + 52)
    ornLine(orn3Y, 56, CW - 56)

    // ── Calendar grid ──
    semSlot.forEach((s, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const cx = semSlot.length === 1 ? Math.floor((CW - cardW) / 2) : PAD + col * (cardW + GAP)
      const cy = rowStartY + row * (cardH + GAP)

      // Card bg — dark glass, subtle gradient top→bottom
      const cBg = ctx.createLinearGradient(cx, cy, cx, cy + cardH)
      cBg.addColorStop(0, `rgba(${Math.min(TR+16,255)},${Math.min(TG+12,255)},${Math.min(TB+16,255)},0.82)`)
      cBg.addColorStop(1, `rgba(${TR},${TG},${TB},0.74)`)
      ctx.fillStyle = cBg; rrect(cx, cy, cardW, cardH, 14); ctx.fill()

      // Card border — very subtle gold
      ctx.save(); ctx.strokeStyle = goldRgba(0.22); ctx.lineWidth = 1
      rrect(cx, cy, cardW, cardH, 14); ctx.stroke(); ctx.restore()

      // Left accent bar — theme accent, soft
      ctx.fillStyle = acRgba(0.38); ctx.fillRect(cx, cy + 16, 3, cardH - 32)

      // Date number + month name side by side
      const dateNum = formatTarikh(s.tarikh).replace(/\s.*$/, "") || "–"
      const dateMonthStr = BNAM[parseInt(tM)] || ""
      ctx.fillStyle = "rgba(255,255,255,0.97)"; ctx.font = "900 82px Lato"; ctx.textAlign = "left"
      ctx.fillText(dateNum, cx + 16, cy + 84)
      const numW = ctx.measureText(dateNum).width
      ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.font = "400 26px Lato"
      ctx.fillText(dateMonthStr, cx + 16 + numW + 8, cy + 66)

      // Day name — top right
      ctx.textAlign = "right"
      ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "600 17px Lato"
      ctx.fillText(s.hari || "", cx + cardW - 16, cy + 28)

      // Thin gold separator below date area
      ctx.save(); ctx.globalAlpha = 0.13; ctx.strokeStyle = GOLD; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx + 16, cy + 100); ctx.lineTo(cx + cardW - 16, cy + 100); ctx.stroke()
      ctx.restore()

      // Program name
      const namaProgram = getNamaProgram(s)
      const _rawPengisian = getPengisian(s)
      const pengisian = ["umum","am","tiada","-","–"].includes(_rawPengisian.trim().toLowerCase()) ? "" : _rawPengisian
      ctx.textAlign = "left"
      let pf = 22; ctx.font = `700 ${pf}px Lato`
      while (ctx.measureText(namaProgram).width > cardW - 32 && pf > 15) { pf--; ctx.font = `700 ${pf}px Lato` }
      ctx.fillStyle = "rgba(255,255,255,0.93)"
      ctx.fillText(namaProgram, cx + 16, cy + (pengisian ? 122 : 136))

      // Topic / pengisian — muted italic
      if (pengisian) {
        ctx.fillStyle = "rgba(255,255,255,0.72)"; ctx.font = "italic 400 18px Lato"
        let pt = pengisian
        while (ctx.measureText(pt).width > cardW - 32 && pt.length > 10) pt = pt.slice(0, -4) + "…"
        ctx.fillText(pt, cx + 16, cy + 156)
      }

      // Waktu — bottom left, soft gold
      const waktuLabel = s.masaKustom || masaWaktu[s.waktu] || s.waktu || ""
      if (waktuLabel) {
        let wf = 16; ctx.font = `400 ${wf}px Lato`
        while (ctx.measureText(waktuLabel).width > cardW - 32 && wf > 12) { wf--; ctx.font = `400 ${wf}px Lato` }
        ctx.fillStyle = goldRgba(0.52); ctx.textAlign = "left"
        ctx.fillText(waktuLabel, cx + 16, cy + cardH - 16)
      }
    })

    // ── Footer ──
    const footY = rowStartY + gridH + 14
    ornLine(footY, 56, CW - 56)
    ctx.fillStyle = "rgba(255,255,255,0.32)"; ctx.font = "italic 400 16px Lato"; ctx.textAlign = "center"
    ctx.fillText("Mohon maklumkan sebarang perubahan jadual kepada pihak masjid.", CW / 2, footY + 34)
    ctx.fillText("Kerjasama ustaz/ustazah amat dihargai.", CW / 2, footY + 54)
    const botG = ctx.createLinearGradient(0, 0, CW, 0)
    botG.addColorStop(0, "rgba(201,162,39,0)"); botG.addColorStop(0.5, "rgba(201,162,39,0.38)"); botG.addColorStop(1, "rgba(201,162,39,0)")
    ctx.fillStyle = botG; ctx.fillRect(0, CH - 5, CW, 5)

    const bulanSlug = `${BNAM[parseInt(tM)] || ""}-${tY || ""}`.toLowerCase().replace(/^-+|-+$/g, "")
    const filename = `kad-penceramah-${namaPenceramah.toLowerCase().replace(/\s+/g, "-")}${bulanSlug ? `-${bulanSlug}` : ""}.png`
    const bulanLabel = `${BNAM[parseInt(tM)] || ""} ${tY || ""}`.trim()
    setPratontonPoster({ dataUrl: canvas.toDataURL("image/png"), filename, isKad: true, namaPenceramah, noTel: pObj?.no_tel || "", bulanLabel, takwimLabel })
  }

  function editPgList(idx, field, value) {
    setEditPenceramah(p => { const list = p.pengisian_list.map((x, i) => i === idx ? { ...x, [field]: value } : x); return { ...p, pengisian_list: list } })
  }
  function removePgList(idx) {
    setEditPenceramah(p => ({ ...p, pengisian_list: p.pengisian_list.filter((_, i) => i !== idx) }))
  }
  function addPgList() {
    setEditPenceramah(p => ({ ...p, pengisian_list: [...p.pengisian_list, { pengisian: "", kitab: "" }] }))
  }
  function editPgKitab(idx, kIdx, value) {
    setEditPenceramah(p => {
      const list = p.pengisian_list.map((x, i) => {
        if (i !== idx) return x
        const arr = Array.isArray(x.kitab) ? [...x.kitab] : [x.kitab || ""]
        arr[kIdx] = value
        return { ...x, kitab: arr }
      })
      return { ...p, pengisian_list: list }
    })
  }
  function addPgKitab(idx) {
    setEditPenceramah(p => {
      const list = p.pengisian_list.map((x, i) => i === idx ? { ...x, kitab: [...(Array.isArray(x.kitab) ? x.kitab : [x.kitab || ""]), ""] } : x)
      return { ...p, pengisian_list: list }
    })
  }
  function removePgKitab(idx, kIdx) {
    setEditPenceramah(p => {
      const list = p.pengisian_list.map((x, i) => {
        if (i !== idx) return x
        const arr = (Array.isArray(x.kitab) ? x.kitab : [x.kitab || ""]).filter((_, ki) => ki !== kIdx)
        return { ...x, kitab: arr.length ? arr : [""] }
      })
      return { ...p, pengisian_list: list }
    })
  }

  // ── Senarai Pengisian & Kitab ──
  // Item dengan ID bermula "_L_" ialah nilai tempatan (jadual DB belum dicipta)
  const isLocalId = id => id?.startsWith("_L_")

  // Cari penceramah dengan nama (sokong perbezaan kecil: titik, spasi berganda)
  const normNama = s => (s || '').replace(/\./g, '').replace(/\s+/g, ' ').trim().toLowerCase()
  const cariPenceramah = nama => penceramahList.find(p => p.nama === nama || normNama(p.nama) === normNama(nama))

  const getPengisian = slot => {
    const pp = cariPenceramah(slot.penceramah)
    const gg = (pp?.pengisian_list || []).filter(x => x.pengisian || kitabTeks(x))
    if (gg.length === 1 && !slot.programRasmi) {
      return [gg[0].pengisian, kitabTeks(gg[0])].filter(Boolean).join(" – ")
    }
    return slot.pengisian || ""
  }

  async function muatSenarai(rows) {
    if (rows === null) {
      // Cuba muat dari localStorage dahulu
      try {
        const saved = localStorage.getItem("biro_senarai_local")
        if (saved) {
          const parsed = JSON.parse(saved)
          setSenaraiPengisian(parsed.filter(x => x.jenis === "pengisian"))
          setSenaraiKitab(parsed.filter(x => x.jenis === "kitab"))
          return
        }
      } catch {}
      // Fallback ke nilai hardcoded
      const lokal = [
        ...PENGISIAN_JENIS.map((nilai, i) => ({ id: `_L_p${i}`, jenis: "pengisian", nilai })),
        ...KITAB_SEDIA_ADA.map((nilai, i) => ({ id: `_L_k${i}`, jenis: "kitab", nilai })),
      ]
      setSenaraiPengisian(lokal.filter(x => x.jenis === "pengisian"))
      setSenaraiKitab(lokal.filter(x => x.jenis === "kitab"))
      return
    }
    let s = rows
    if (s.length === 0) {
      // Jadual wujud tapi kosong — seed terus
      const benih = [
        ...PENGISIAN_JENIS.map(nilai => ({ jenis: "pengisian", nilai })),
        ...KITAB_SEDIA_ADA.map(nilai => ({ jenis: "kitab", nilai })),
      ]
      const { data: hasil } = await supabase.from("biro_senarai").insert(benih).select()
      s = hasil || []
    }
    setSenaraiPengisian(s.filter(x => x.jenis === "pengisian"))
    setSenaraiKitab(s.filter(x => x.jenis === "kitab"))
  }

  async function tambahSenarai(jenis) {
    const nilai = inputSenarai[jenis].trim()
    if (!nilai) return
    const senaraiSemasa = jenis === "pengisian" ? senaraiPengisian : senaraiKitab
    if (senaraiSemasa.some(x => x.nilai.toLowerCase() === nilai.toLowerCase())) { setInputSenarai(p => ({ ...p, [jenis]: "" })); return }
    const modeLokal = senaraiSemasa.some(x => isLocalId(x.id))
    if (modeLokal) {
      const baru = [...senaraiSemasa, { id: `_L_${Date.now()}`, jenis, nilai }].sort((a, b) => a.nilai.localeCompare(b.nilai))
      if (jenis === "pengisian") setSenaraiPengisian(baru); else setSenaraiKitab(baru)
      setInputSenarai(p => ({ ...p, [jenis]: "" }))
      return
    }
    const { data: row, error } = await supabase.from("biro_senarai").insert({ jenis, nilai }).select().single()
    if (error) { alert("Gagal tambah: " + error.message); return }
    const baru = [...senaraiSemasa, row].sort((a, b) => a.nilai.localeCompare(b.nilai))
    if (jenis === "pengisian") setSenaraiPengisian(baru); else setSenaraiKitab(baru)
    setInputSenarai(p => ({ ...p, [jenis]: "" }))
  }

  async function kemasSenarai(id, jenis, nilai) {
    const v = nilai.trim()
    if (!v) return
    const senaraiSemasa = jenis === "pengisian" ? senaraiPengisian : senaraiKitab
    if (!isLocalId(id)) {
      const { error } = await supabase.from("biro_senarai").update({ nilai: v }).eq("id", id)
      if (error) { alert("Gagal kemas kini: " + error.message); return }
    }
    const baru = senaraiSemasa.map(x => x.id === id ? { ...x, nilai: v } : x).sort((a, b) => a.nilai.localeCompare(b.nilai))
    if (jenis === "pengisian") setSenaraiPengisian(baru); else setSenaraiKitab(baru)
    setEditSenarai(null)
  }

  async function padamSenarai(id, jenis) {
    if (!isLocalId(id)) {
      const { error } = await supabase.from("biro_senarai").delete().eq("id", id)
      if (error) { alert("Gagal padam: " + error.message); return }
    }
    const senaraiSemasa = jenis === "pengisian" ? senaraiPengisian : senaraiKitab
    const baru = senaraiSemasa.filter(x => x.id !== id)
    if (jenis === "pengisian") setSenaraiPengisian(baru); else setSenaraiKitab(baru)
  }

  // Financial calcs
  const semuaSlot = (data?.minggu.flatMap(m => m.slots) || []).filter(s => !s.muslimat && !s.ditangguhJadual)
  const slotOpsAgihan = semuaSlot
    .slice()
    .sort((a, b) => (tarikhKeISO(a.tarikh, bulanAktif?.bulan)||"").localeCompare(tarikhKeISO(b.tarikh, bulanAktif?.bulan)||""))
    .map(s => ({ id: s.id, label: `${formatTarikh(s.tarikh)||s.tarikh} ${s.hari} ${s.waktu}` }))
  const _pb = pecahBaki(data?.bakiLalu)
  const bakiLaluTotal = data ? _pb.total : 0       // jumlah penuh — untuk paparan kad & baki akhir
  const bakiBudgetLalu = data ? _pb.selainTotal : 0 // hanya Selain Subuh extend bajet agihan berurutan
  const totalAgihan = (data?.agihan || []).reduce((a, e) => a + (e.jumlah || 0), 0)
  const eligibleFlat = semuaSlot
    .filter(s => s.kadar > 0 && !s.ditangguhJadual)
    .sort((a, b) => (tarikhKeISO(a.tarikh, bulanAktif?.bulan)||"").localeCompare(tarikhKeISO(b.tarikh, bulanAktif?.bulan)||""))
  // Kecualikan slot Subuh earmark dari jujukan supaya agihan tidak "bayar berganda"
  const _earmarkSubuhFlat = (() => {
    if (!data || _pb.subuhSlot <= 0) return new Set()
    const sorted = eligibleFlat.filter(s => s.waktu === "Subuh")
    return new Set(sorted.slice(0, _pb.subuhSlot).map(s => s.id))
  })()
  // Tangguh + Tiada Pengganti tak pernah dibayar — jangan biar ia makan bajet agihan
  const eligibleFlatForSeq = eligibleFlat.filter(s => !_earmarkSubuhFlat.has(s.id) && !(s.status === "Tangguh" && s.ganti === "Tiada Pengganti"))
  const { permulaan: slotPermulaan } = data ? hitungAgihanInfo(data.agihan || [], eligibleFlatForSeq, bakiBudgetLalu) : { permulaan: [] }
  const totalDibayar = semuaSlot.reduce((a, s) => s.sebenar ? a + (s.kadar || 0) + (s.sarapan || 0) : a, 0)
  const totalGanjak = semuaSlot.filter(s => s.status === "Tangguh" && s.kadar > 0 && !s.ditangguhJadual).reduce((a, s) => a + s.kadar + s.sarapan, 0)
  const baki = totalAgihan + bakiLaluTotal - totalDibayar

  // PDF
  async function janaLaporanPDF() {
    if (!data || !bulanAktif || laporanLoading) return
    autoAnjakan()
    setLaporanLoading(true)
    try {
      const tarCetak = new Date().toLocaleDateString("ms-MY", { day: "2-digit", month: "long", year: "numeric" })
      const saguhatiTotal = semuaSlot.filter(s => s.sebenar).reduce((a, s) => a + (s.kadar || 0), 0)
      const sarapanTotal = semuaSlot.filter(s => s.sebenar).reduce((a, s) => a + (s.sarapan || 0), 0)

      const slotLaporan = semuaSlot.filter(s => !(s.penceramah || "").includes("Imam Bertugas"))

      // Compute anjakan links locally so PDF reflects tangguh status even without clicking "Kira Anjakan Auto"
      const anjakanMap = new Map()
      // slot Tangguh (id) -> slot gantian sebenar (objek) — untuk atribut kos gantian kepada
      // agihan ASAL tangguh tu (bukan agihan yang aktif pada tarikh gantian sebenar berlaku)
      const tangguhGantianSlot = new Map()
      {
        const _pbA = pecahBaki(data.bakiLalu)
        const flatAllA = []
        data.minggu.forEach(m => m.slots.forEach(s => {
          if ((!s.kadar && !s.programRasmi) || s.muslimat || s.ditangguhJadual) return
          flatAllA.push({ s, iso: tarikhKeISO(s.tarikh, bulanAktif?.bulan) || "z" })
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

      // Kira slot yang covered oleh agihan untuk kolum Peruntukan + label slot permulaan
      const eligibleSorted = slotLaporan
        .filter(s => s.kadar > 0 && !s.ditangguhJadual)
        .slice()
        .sort((a, b) => (tarikhKeISO(a.tarikh, bulanAktif?.bulan)||"").localeCompare(tarikhKeISO(b.tarikh, bulanAktif?.bulan)||""))
      // Pecahkan baki: Selain Subuh extend bajet agihan; Subuh earmark slot Subuh terawal
      const pb = pecahBaki(data.bakiLalu)
      // Baki Subuh (RM150): earmark untuk pb.subuhSlot slot Subuh terawal (kronologi), tanpa mengira agihan
      // "z" supaya slot tanpa tarikh susun SELEPAS tarikh sah, bukan sebelum
      const slotLaporanSorted = slotLaporan.slice().sort((a, b) =>
        (tarikhKeISO(a.tarikh, bulanAktif?.bulan)||"z").localeCompare(tarikhKeISO(b.tarikh, bulanAktif?.bulan)||"z"))
      const bakiSubuhIds = new Set(
        slotLaporanSorted.filter(s => s.waktu === "Subuh").slice(0, pb.subuhSlot).map(s => s.id)
      )

      // Kecualikan slot earmark Subuh dari jujukan agihan — elak pengiraan berganda
      // (jika tidak dikecualikan, agihan 2 akan "bayar" slot Subuh DAN baki juga bayar → agihan 2 lebih singkat)
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

      // Baki Selain Subuh (RM100): slot yang covered oleh baki — bandingkan agihan[0] sahaja
      // (bandingkan semua agihan menyebabkan agihan[1] turut shift, menandakan slot tambahan secara salah)
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
      // Slot dianggap "covered" (Peruntukan) jika dalam jangkauan agihan+baki-selain ATAU earmark baki-subuh/baki-selain
      const coveredIds = new Set(coveredSeq)
      for (const id of bakiSubuhIds) coveredIds.add(id)
      for (const id of bakiSaguhatiIds) coveredIds.add(id)

      // Jana PDF sebenar dengan jsPDF + autoTable (baris tidak terpotong, header berulang)
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        importSelamat(() => import("jspdf")),
        importSelamat(() => import("jspdf-autotable"))
      ])
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pageW = doc.internal.pageSize.getWidth()
      const mg = 10
      const cW = pageW - mg * 2
      let y = mg

      // Tajuk
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(30, 58, 95)
      doc.text(data.masjid, mg, y); y += 4
      doc.setFontSize(8.5)
      doc.setFont("helvetica", "normal")
      doc.text("Biro Pendidikan — Laporan Sagu Hati Penceramah", mg, y); y += 3
      doc.setFontSize(7.5)
      doc.setTextColor(107, 114, 128)
      doc.text(`Tempoh: ${bulanAktif?.label}   |   Tarikh Cetak: ${tarCetak}`, mg, y); y += 2
      doc.setDrawColor(30, 58, 95); doc.setLineWidth(0.4)
      doc.line(mg, y, pageW - mg, y); y += 3

      // Badge
      doc.setFillColor(30, 58, 95)
      doc.roundedRect(pageW - mg - 32, mg - 1, 32, 6, 1, 1, "F")
      doc.setFontSize(7); doc.setTextColor(255, 255, 255)
      doc.text("LAPORAN KEWANGAN", pageW - mg - 16, mg + 3.5, { align: "center" })

      // Baki lalu
      doc.setFontSize(7.5); doc.setTextColor(124, 58, 237)
      doc.setFont("helvetica", "bold")
      doc.text("Baki Anjakan:", mg, y)
      doc.setTextColor(50, 50, 50); doc.setFont("helvetica", "normal")
      doc.text(`${data.bakiLalu.catatan||"—"}   Selain Subuh: ${data.bakiLalu.selainSubuhSet||0} slot (RM ${(data.bakiLalu.selainSubuhSet||0)*100})   Subuh: ${data.bakiLalu.subuhSet||0} slot (RM ${(data.bakiLalu.subuhSet||0)*150})   Jumlah: RM ${bakiLaluTotal}`, mg + 22, y); y += 3

      // Agihan
      const agihanTeks = (data.agihan||[]).length === 0 ? "Tiada rekod" : (data.agihan||[]).map((a, i) => `${getAgihanLabel(a, i)}: RM ${a.jumlah}`).join("   |   ")
      doc.setFontSize(7.5); doc.setTextColor(30, 58, 95); doc.setFont("helvetica", "bold")
      doc.text("Agihan Bendahari:", mg, y)
      doc.setTextColor(50, 50, 50); doc.setFont("helvetica", "normal")
      doc.text(agihanTeks, mg + 28, y); y += 3

      // Kad ringkasan
      const cards = [
        ["Baki Lalu", `RM ${bakiLaluTotal}`, [124, 58, 237]],
        ["Diagihkan", `RM ${totalAgihan}`, [30, 58, 95]],
        ["Tersedia", `RM ${bakiLaluTotal+totalAgihan}`, [15, 118, 110]],
        ["Dibayar", `RM ${totalDibayar}`, [22, 163, 74]],
        ["Anjakan", `RM ${totalGanjak}`, [217, 119, 6]],
        ["Baki Akhir", `RM ${baki}`, baki >= 0 ? [15, 118, 110] : [220, 38, 38]],
      ]
      const cardW = cW / 6
      cards.forEach(([label, value, rgb], i) => {
        const x = mg + i * cardW
        doc.setDrawColor(226, 232, 240); doc.setFillColor(255, 255, 255)
        doc.roundedRect(x, y, cardW - 1.5, 8, 1, 1, "FD")
        doc.setFontSize(6.5); doc.setTextColor(107, 114, 128)
        doc.text(label, x + 2, y + 2.5)
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...rgb)
        doc.text(value, x + 2, y + 6.5)
      })
      y += 11

      // Label seksyen jadual
      doc.setFillColor(30, 58, 95)
      doc.rect(mg, y, 2, 4.5, "F")
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 58, 95)
      doc.text("Senarai Kuliah Bulanan", mg + 3.5, y + 3.5); y += 5

      // autoTable
      const namaPendek = (nama) => {
        if (!nama) return "—"
        const tanpaBin = nama.replace(/\s+bin(ti)?\s+.+$/i, "").trim()
        return tanpaBin.split(/\s+/).slice(0, 4).join(" ")
      }
      const tableRows = slotLaporan.map((s, i) => {
        const _sebenar = s.sebenar && (s.status === "Hadir" || s.status === "Ganti")
        const dibayar = _sebenar ? (s.kadar || 0) + (s.sarapan || 0) : 0
        const pengRingkas = s.pengisian ? s.pengisian.split(" – ")[0] : "—"
        const _perinciStatus = s.ganti && s.ganti !== "Tiada Pengganti" ? namaPendek(s.ganti)
          : s.status === "Tangguh" ? "Tiada Pengganti"
          : "—"
        const _notaBayaran = []
        const _am = anjakanMap.get(s.id) || {}
        if (s.anjakanKe || _am.anjakanKe) _notaBayaran.push(`Anjak: ${s.anjakanKe || _am.anjakanKe}`)
        if (s.anjakanDari || _am.anjakanDari) _notaBayaran.push(`Dari: ${s.anjakanDari || _am.anjakanDari}`)
        if (bakiSubuhIds.has(s.id)) _notaBayaran.push("Dari: Baki Subuh Bulan Lalu")
        if (bakiSaguhatiIds.has(s.id)) _notaBayaran.push("Dari: Baki Bulan Lalu")
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
          _notaBayaran.join(" / ") || "—",
          dibayar > 0 ? `RM ${dibayar}` : "—",
        ]
      })
      const totalPeruntukan = slotLaporan.reduce((a, s) => coveredIds.has(s.id) && s.kadar > 0 ? a + (s.kadar||0) + (s.sarapan||0) : a, 0)
      const bakiPeruntukan = totalPeruntukan - totalDibayar
      const statusColor = { "Hadir": [22, 163, 74], "Ganti": [37, 99, 235], "Tangguh": [217, 119, 6] }

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
          pushLebihan(curGroup)   // tutup agihan sebelum dengan baris lebihan (jika ada)
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
      pushLebihan(curGroup)   // tutup agihan terakhir

      autoTable(doc, {
        startY: y,
        margin: { left: mg, right: mg },
        head: [["Bil.", "Tarikh", "Hari", "Waktu", "Pengisian", "Penceramah", "Peruntukan", "Status", "Perincian Status", "Sagu Hati", "Sarapan", "Nota", "Jumlah"]],
        body: tableRowsWithSep,
        foot: [
          ["", "", "", "", "", "JUMLAH KESELURUHAN", `RM ${totalPeruntukan}`, "", "", `RM ${saguhatiTotal}`, `RM ${sarapanTotal}`, "", `RM ${totalDibayar}`],
          ["", "", "", "", "", "BAKI (Peruntukan - Sebenar)", `RM ${bakiPeruntukan}`, "", "", "", "", "", ""],
        ],
        showFoot: "lastPage",
        styles: { fontSize: 8, cellPadding: 1.5, font: "helvetica" },
        headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
        footStyles: { fillColor: [239, 246, 255], textColor: [30, 58, 95], fontStyle: "bold", fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { cellWidth: 14 },
          2: { cellWidth: 12 },
          3: { cellWidth: 16 },
          4: { cellWidth: 26 },
          5: { cellWidth: 43 },
          6: { halign: "right", cellWidth: 20 },
          7: { cellWidth: 16 },
          8: { cellWidth: 32 },
          9: { halign: "right", cellWidth: 18 },
          10: { halign: "right", cellWidth: 15 },
          11: { cellWidth: 39 },
          12: { halign: "right", cellWidth: 18 },
        },
        didParseCell: (d) => {
          if (d.column.index === 3 && d.section === "body") {
            const waktuBg = { "Subuh": [238,242,255], "Duha": [255,251,235], "Asar": [255,247,237], "Jumaat": [240,253,244], "Maghrib": [255,241,242], "Isyak": [250,245,255] }
            const waktuTxt = { "Subuh": [55,48,163], "Duha": [146,64,14], "Asar": [154,52,18], "Jumaat": [20,83,45], "Maghrib": [159,18,57], "Isyak": [91,33,182] }
            const bg = waktuBg[d.cell.raw]; const txt = waktuTxt[d.cell.raw]
            if (bg) { d.cell.styles.fillColor = bg; d.cell.styles.textColor = txt; d.cell.styles.fontStyle = "bold" }
          }
          if (d.column.index === 7 && d.section === "body") {
            const c = statusColor[d.cell.raw]
            if (c) { d.cell.styles.textColor = c; d.cell.styles.fontStyle = "bold" }
          }
          if (d.column.index === 12 && d.section === "body" && d.cell.raw !== "—") {
            d.cell.styles.textColor = [22, 163, 74]; d.cell.styles.fontStyle = "bold"
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
          if (d.section === "foot" && [6, 9, 10, 12].includes(d.column.index)) {
            d.cell.styles.halign = "right"
          }
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
              doc.setDrawColor(160, 160, 160); doc.setLineWidth(0.3)
              doc.line(xL, lineY, xR, lineY)
            }
          }
        },
      })

      const namaFail = `Laporan_Sagu_Hati_${bulanAktif.label.replace(/\s/g, "_")}.pdf`
      const blobUrl = doc.output("bloburl")

      // Render setiap halaman PDF jadi imej (pdf.js) supaya pratonton sama persis & berfungsi pada semua peranti
      const pageImgs = await renderPdfKeImej(doc.output("arraybuffer"))
      setPraLaporanState({ url: blobUrl, namaFail, pages: pageImgs })
    } catch (err) {
      console.error("Ralat jana laporan PDF:", err)
      alert("Ralat semasa menjana laporan PDF. Sila cuba lagi.")
    } finally {
      setLaporanLoading(false)
    }
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
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext("2d")
      await page.render({ canvasContext: ctx, viewport }).promise
      imgs.push(canvas.toDataURL("image/jpeg", 0.9))
    }
    return imgs
  }

  async function janaJadualCetak() {
    if (!data || !bulanAktif || cetakLoading) return
    setCetakLoading(true)
    try {
      const MASA = { Duha: "9:00am–10:30am", Jumaat: "12:30pm – waktu Jumaat" }
      const MASA_KHAS = { "Khamis|Duha": "10:00am–12:00pm" }
      const PANDUAN = {
        Subuh: "Selepas Subuh hingga waktu Isyrak",
        Duha: "9:00am hingga 10:30am (Selasa & Rabu) · 10:00am hingga 12:00pm (Khamis)",
        Jumaat: "12:30pm hingga waktu Jumaat",
        Maghrib: "Selepas Maghrib hingga waktu Isya'",
      }
      const WAKTU_C = { Subuh: "#4338ca", Duha: "#d97706", Asar: "#ea580c", Jumaat: "#16a34a", Maghrib: "#b91c1c", Isyak: "#7c3aed" }
      const WAKTU_BG = { Subuh: "#eef2ff", Duha: "#fffbeb", Asar: "#fff7ed", Jumaat: "#f0fdf4", Maghrib: "#fff1f2", Isyak: "#faf5ff" }
      const WAKTU_ORD = ["Subuh", "Duha", "Asar", "Jumaat", "Maghrib", "Isyak"]

      const [yr, mo] = bulanAktif.bulan.split("-").map(Number)
      const dayMap = {}
      data.minggu.forEach(m => m.slots.forEach(s => {
        if (!s.tarikh || s.kewanganSahaja) return
        const iso = tarikhKeISO(s.tarikh, bulanAktif.bulan)
        if (!iso) return
        const d = new Date(iso + "T00:00:00").getDate()
        if (!dayMap[d]) dayMap[d] = []
        dayMap[d].push(s)
      }))
      Object.values(dayMap).forEach(arr => arr.sort((a, b) => WAKTU_ORD.indexOf(a.waktu) - WAKTU_ORD.indexOf(b.waktu)))

      const firstDow = new Date(yr, mo - 1, 1).getDay()
      const daysInMonth = new Date(yr, mo, 0).getDate()
      const cells = [...Array(firstDow).fill(null)]
      for (let d = 1; d <= daysInMonth; d++) cells.push(d)
      while (cells.length % 7) cells.push(null)
      const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))

      // A2 landscape — Islamik Elegan
      const S = {
        thPad:       "11px 6px",
        thFont:      "16pt",
        cellPad:     "5px",
        dateFont:    "19pt",
        dateMB:      "5px",
        nameFont:    "16pt",
        topicFont:   "13pt",
        waktuFont:   "14pt",
        masaFont:    "12pt",
        slotMB:      "3px",
        emptyH:      "30px",
        slotHdrPad:  "4px 8px",
        slotBodyPad: "5px 8px 6px 8px",
        hdrMB:       "10px",
        hdrFont:     "25pt",
        logoSize:    "110px",
        contPad:     "16px 22px",
      }
      const logoUrl = window.location.origin + "/logo-masjid.jpg"

      // Preload logo sebagai dataURL supaya html2canvas boleh render tanpa CORS
      const logoDataUrl = await new Promise(resolve => {
        const img = new Image()
        img.onload = () => {
          const c = document.createElement("canvas")
          c.width = img.naturalWidth; c.height = img.naturalHeight
          c.getContext("2d").drawImage(img, 0, 0)
          try { resolve(c.toDataURL("image/png")) } catch { resolve("") }
        }
        img.onerror = () => resolve("")
        img.src = "/logo-masjid.jpg"
      })

      // Preload gambar penceramah sebagai dataURL (sama teknik, elak CORS html2canvas)
      const gambarCache = {}
      const pImgToDataUrl = url => new Promise(resolve => {
        const img = new Image(); img.crossOrigin = "anonymous"
        img.onload = () => {
          const c = document.createElement("canvas")
          c.width = img.naturalWidth; c.height = img.naturalHeight
          const pc2 = c.getContext("2d")
          pc2.fillStyle = "#ffffff"; pc2.fillRect(0, 0, c.width, c.height)
          pc2.drawImage(img, 0, 0)
          // Kesan & padamkan latar hitam: sampel 3 sudut gambar
          const id = pc2.getImageData(0, 0, c.width, c.height)
          const d = id.data, W4 = c.width * 4
          const c0=d[0]+d[1]+d[2], c1=d[W4-4]+d[W4-3]+d[W4-2]
          const c2=d[(c.height-1)*W4]+d[(c.height-1)*W4+1]+d[(c.height-1)*W4+2]
          if ((c0+c1+c2)/9 < 40) {
            for (let i = 0; i < d.length; i += 4) {
              if (0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2] < 50) {
                d[i]=255; d[i+1]=255; d[i+2]=255
              }
            }
            pc2.putImageData(id, 0, 0)
          }
          try { resolve(c.toDataURL("image/jpeg", 0.85)) } catch { resolve("") }
        }
        img.onerror = () => resolve("")
        img.src = url
      })
      const uniqueNama = [...new Set(Object.values(dayMap).flat().map(s => s.penceramah).filter(Boolean))]
      await Promise.all(uniqueNama.map(async nama => {
        const pObj = semPenceramah.find(p => p.nama === nama)
        if (pObj?.gambar_url) {
          const du = await pImgToDataUrl(pObj.gambar_url)
          if (du) gambarCache[nama] = du
        }
      }))

      // Lebar lajur dinamik — ikut bilangan slot maksimum bagi setiap hari seminggu
      const maxSlotsPerDow = Array(7).fill(0)
      weeks.forEach(week => week.forEach((d, dow) => {
        if (d) maxSlotsPerDow[dow] = Math.max(maxSlotsPerDow[dow], (dayMap[d] || []).length)
      }))
      // Berat: hari tiada slot = 0.6, 1 slot = 1.0, 2 slot = 1.6, 3+ = 2.1
      const colWeights = maxSlotsPerDow.map(n => n === 0 ? 0.6 : n === 1 ? 1.0 : n === 2 ? 1.6 : 2.1)
      const totalColW = colWeights.reduce((a, b) => a + b, 0)
      const colGroupHtml = colWeights.map(w => `<col style="width:${(w / totalColW * 100).toFixed(2)}%">`).join("")

      const DAYS = ["AHAD", "ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT", "SABTU"]
      const dayHdr = DAYS.map((d, i) => {
        const [bg, bgDark] = i === 5 ? ["#166534","#0f3d20"] : i === 0 ? ["#7c1d1d","#4a0f0f"] : ["#1e3a5f","#0f1f35"]
        return `<th style="background:linear-gradient(180deg,${bg} 0%,${bgDark} 100%);color:#fff;font-size:${S.thFont};font-weight:800;padding:${S.thPad};text-align:center;letter-spacing:1.5px;border:1.5px solid #c9a227">${d}</th>`
      }).join("")

      const weekHtml = weeks.map(week => {
        const tds = week.map(d => {
          if (!d) return `<td style="background:#f5f3ee;border:1.5px solid #c9a227"></td>`
          const slots = dayMap[d] || []
          const dow = new Date(yr, mo - 1, d).getDay()
          const DAY_BG    = ["#fff7f7","#eff6ff","#faf5ff","#fff7ed","#f0fdfa","#f0fdf4","#fefce8"]
          const DAY_COLOR = ["#7c1d1d","#1d4ed8","#7c3aed","#c2410c","#0f766e","#166534","#a16207"]
          const dateBg    = DAY_BG[dow]
          const dateColor = DAY_COLOR[dow]
          const sHtml = slots.map(s => {
            const c = WAKTU_C[s.waktu] || "#475569"
            const bg = WAKTU_BG[s.waktu] || "#f8fafc"
            const masaLabel = s.waktu === "Duha" ? (MASA_KHAS[s.hari + "|" + s.waktu] || MASA[s.waktu] || "") : ""
            const isTangguh = !!s.ditangguhJadual
            const isProgramRasmi = !!s.programRasmi || (s.jenisProgram || "").startsWith("Program ")

            if (isProgramRasmi) {
              const namaProgram = s.penceramah ? `<div style="font-size:${S.nameFont};font-weight:700;color:#4a1d96;line-height:1.45;overflow-wrap:break-word;word-break:break-word">${s.penceramah}</div>` : ""
              const huraian = s.pengisian ? `<div style="font-size:${S.topicFont};color:#6b21a8;margin-top:3px;line-height:1.4;overflow-wrap:break-word;word-break:break-word">${s.pengisian}</div>` : ""
              const nota = s.notaProgram ? `<div style="font-size:9pt;color:#6b21a8;font-style:italic;margin-top:3px;line-height:1.4;overflow-wrap:break-word">${s.notaProgram}</div>` : ""
              return `<div style="border:1px solid #d8b4fe;border-left:5px solid #7e22ce;border-radius:0 5px 5px 0;margin-bottom:${S.slotMB};overflow:hidden;background:#faf5ff">
                <div style="padding:${S.slotHdrPad};border-bottom:1px solid #e9d5ff">
                  <span style="font-size:${S.waktuFont};font-weight:800;color:#7e22ce">★ ${getNamaProgram(s).toUpperCase()}</span>
                </div>
                <div style="padding:${S.slotBodyPad}">${namaProgram}${huraian}${nota}</div>
              </div>`
            }

            const namaAsal = s.penceramah || ""
            const nama = namaAsal ? `<div style="font-size:${S.nameFont};font-weight:700;color:${isTangguh ? "#b91c1c" : "#1e293b"};line-height:1.45;overflow-wrap:break-word;word-break:break-word">${namaAsal}</div>` : ""
            const topik = s.pengisian ? `<div style="font-size:${S.topicFont};color:#64748b;margin-top:3px;line-height:1.4;overflow-wrap:break-word;word-break:break-word">${s.pengisian}</div>` : ""
            const tangguhBadge = isTangguh ? `<div style="display:inline-block;font-size:${S.waktuFont};font-weight:700;color:#b91c1c;background:#fee2e2;border-radius:3px;padding:3px 8px;margin-top:4px">✕ DITANGGUHKAN</div>` : ""
            const tangguhNota = (isTangguh && s.ganti) ? `<div style="font-size:${S.topicFont};color:#b91c1c;font-style:italic;margin-top:3px;line-height:1.4;overflow-wrap:break-word">${s.ganti}</div>` : ""
            const borderColor = isTangguh ? "#b91c1c" : c
            const gambarDataUrl = gambarCache[namaAsal]
            const photoHtml = gambarDataUrl
              ? `<img src="${gambarDataUrl}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid ${borderColor};margin-top:1px">`
              : ""
            const bodyInner = gambarDataUrl
              ? `<div style="display:flex;align-items:flex-start;gap:7px">${photoHtml}<div style="flex:1;min-width:0">${nama}${topik}${tangguhBadge}${tangguhNota}</div></div>`
              : `${nama}${topik}${tangguhBadge}${tangguhNota}`
            return `<div style="border:1px solid #e2e8f0;border-left:5px solid ${borderColor};border-radius:0 5px 5px 0;margin-bottom:${S.slotMB};overflow:hidden;background:${isTangguh ? "#fff5f5" : "white"}">
              <div style="padding:${S.slotHdrPad};display:flex;align-items:center;gap:7px;border-bottom:1px solid #f1f5f9">
                <span style="font-size:${S.waktuFont};font-weight:800;color:${borderColor};text-transform:uppercase">${getNamaProgram(s)}</span>
                ${masaLabel ? `<span style="font-size:${S.masaFont};color:#94a3b8">${masaLabel}</span>` : ""}
              </div>
              <div style="padding:${S.slotBodyPad}">${bodyInner}</div>
            </div>`
          }).join("")
          return `<td style="border:1.5px solid #c9a227;vertical-align:top;padding:${S.cellPad};background:${dateBg}">
            <div style="display:inline-block;font-size:${S.dateFont};font-weight:900;color:${dateColor};line-height:1;margin-bottom:${S.dateMB};padding-bottom:3px;border-bottom:2.5px solid ${dateColor}">${d}</div>
            ${sHtml}
          </td>`
        }).join("")
        return `<tr>${tds}</tr>`
      }).join("")

      const legendaHtml = Object.entries(WAKTU_C).filter(([w]) => PANDUAN[w]).map(([w, c]) =>
        `<div style="display:flex;align-items:center;gap:7px"><div style="width:4px;height:18px;border-radius:2px;background:${c};flex-shrink:0"></div><span style="font-size:10pt;color:#475569"><b style="color:${c}">${w}</b> — ${PANDUAN[w]}</span></div>`
      ).join("")

      const cornerTL = `<svg width="65" height="65" viewBox="0 0 65 65" xmlns="http://www.w3.org/2000/svg"><path d="M5 5 L5 38 L10 38 L10 10 L38 10 L38 5 Z" fill="#c9a227"/><path d="M14 14 L14 30 L19 30 L19 19 L30 19 L30 14 Z" fill="#c9a227" opacity="0.55"/><circle cx="5" cy="5" r="4" fill="#c9a227"/></svg>`
      const cornerTR = `<svg width="65" height="65" viewBox="0 0 65 65" xmlns="http://www.w3.org/2000/svg"><path d="M60 5 L60 38 L55 38 L55 10 L27 10 L27 5 Z" fill="#c9a227"/><path d="M51 14 L51 30 L46 30 L46 19 L35 19 L35 14 Z" fill="#c9a227" opacity="0.55"/><circle cx="60" cy="5" r="4" fill="#c9a227"/></svg>`
      const cornerBL = `<svg width="65" height="65" viewBox="0 0 65 65" xmlns="http://www.w3.org/2000/svg"><path d="M5 60 L5 27 L10 27 L10 55 L38 55 L38 60 Z" fill="#c9a227"/><path d="M14 51 L14 35 L19 35 L19 46 L30 46 L30 51 Z" fill="#c9a227" opacity="0.55"/><circle cx="5" cy="60" r="4" fill="#c9a227"/></svg>`
      const cornerBR = `<svg width="65" height="65" viewBox="0 0 65 65" xmlns="http://www.w3.org/2000/svg"><path d="M60 60 L60 27 L55 27 L55 55 L27 55 L27 60 Z" fill="#c9a227"/><path d="M51 51 L51 35 L46 35 L46 46 L35 46 L35 51 Z" fill="#c9a227" opacity="0.55"/><circle cx="60" cy="60" r="4" fill="#c9a227"/></svg>`
      const logoEl = logoDataUrl
        ? `<img src="${logoDataUrl}" style="width:${S.logoSize};height:${S.logoSize};object-fit:contain;flex-shrink:0;border-radius:50%;border:4px solid #c9a227;background:white;padding:4px;box-sizing:border-box">`
        : `<div style="width:${S.logoSize};flex-shrink:0"></div>`

      const innerHtml = `
        <div style="position:absolute;top:10px;left:10px;pointer-events:none">${cornerTL}</div>
        <div style="position:absolute;top:10px;right:10px;pointer-events:none">${cornerTR}</div>
        <div style="position:absolute;bottom:10px;left:10px;pointer-events:none">${cornerBL}</div>
        <div style="position:absolute;bottom:10px;right:10px;pointer-events:none">${cornerBR}</div>
        <div style="background:linear-gradient(135deg,#0f1f35 0%,#1e3a5f 60%,#2a4f7a 100%);padding:22px 32px;border-top:4px solid #c9a227;border-bottom:4px solid #c9a227;display:flex;align-items:center;gap:24px;margin-bottom:${S.hdrMB}">
          ${logoEl}
          <div style="flex:1;text-align:center">
            <div style="font-size:11pt;color:#c9a227;letter-spacing:6px;text-transform:uppercase;margin-bottom:6px">Jadual Kuliah Bulanan</div>
            <div style="font-size:${S.hdrFont};font-weight:900;color:#ffffff;letter-spacing:2px;line-height:1.1;text-transform:uppercase">${data.masjid}</div>
            <div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,#c9a227,transparent);margin:8px auto"></div>
            <div style="font-size:18pt;color:#ffffff;font-weight:900;letter-spacing:3px;margin-bottom:4px">${bulanAktif.label.toUpperCase()}</div>
            <div style="font-size:10pt;color:rgba(201,162,39,0.85);letter-spacing:1.5px;text-transform:uppercase">Biro Pendidikan dan Dakwah</div>
          </div>
          <div style="width:${S.logoSize};flex-shrink:0"></div>
        </div>
        <div style="flex:1;min-height:0;overflow:hidden">
          <table style="width:100%;height:100%;border-collapse:collapse;table-layout:fixed"><colgroup>${colGroupHtml}</colgroup><thead><tr>${dayHdr}</tr></thead><tbody>${weekHtml}</tbody></table>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:2px solid #c9a227;padding-top:8px">
          <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center">${legendaHtml}</div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:10pt;color:#64748b;letter-spacing:0.3px;white-space:nowrap">Disediakan Oleh Biro Pendidikan dan Dakwah MPS</div>
            <div style="font-size:9pt;color:#94a3b8;font-style:italic;white-space:nowrap;margin-top:2px">*Jadual ini tertakluk kepada perubahan tanpa notis awal.</div>
          </div>
        </div>
      `

      // A2 landscape = 594mm × 420mm = 2245px × 1587px @ 96dpi
      const CONT_W = 2245
      const MAX_H = 1587
      const container = document.createElement("div")
      container.style.cssText = `position:fixed;top:0;left:0;width:${CONT_W}px;z-index:-9999;background:white;overflow:visible;pointer-events:none`
      document.body.appendChild(container)
      container.innerHTML = `<div class="_jkcetak" style="position:relative;width:${CONT_W}px;background:#fff;font-family:Arial,sans-serif;padding:${S.contPad};box-sizing:border-box;border:3px solid #c9a227;display:flex;flex-direction:column">${innerHtml}</div>`
      await new Promise(r => setTimeout(r, 300))

      const el = container.querySelector("._jkcetak")
      if (!el) throw new Error("Element not found")

      // Jika konten lebih pendek dari MAX_H, stretch jadual penuhi halaman
      if (el.scrollHeight <= MAX_H) {
        el.style.height = MAX_H + "px"
        el.style.overflow = "hidden"
        await new Promise(r => setTimeout(r, 100))
      }

      // Render canvas terus — jangan guna html2pdf (ia paginate automatik)
      const { default: html2canvas } = await importSelamat(() => import("html2canvas"))
      const canvas = await html2canvas(el, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: CONT_W,
        width: CONT_W,
      })

      // Paksa imej isi penuh 1 halaman A2 landscape (594 × 420 mm)
      const { jsPDF } = await importSelamat(() => import("jspdf"))
      const namaFail = `Jadual_Kuliah_${bulanAktif.label.replace(/\s/g, "_")}.pdf`
      const pdf = new jsPDF({ unit: "mm", format: "a2", orientation: "landscape" })
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 594, 420)
      const blobUrl = URL.createObjectURL(pdf.output("blob"))

      document.body.removeChild(container)

      const resp = await fetch(blobUrl)
      const arrayBuffer = await resp.arrayBuffer()
      const pages = await renderPdfKeImej(arrayBuffer)
      setPraState({ url: blobUrl, namaFail, pages })
    } catch (err) {
      console.error("Ralat jana PDF:", err)
      alert("Ralat semasa menjana PDF. Sila cuba lagi.")
      try { document.body.removeChild(container) } catch {}
    } finally {
      setCetakLoading(false)
    }
  }

  async function janaJadualWA() {
    if (!data || !bulanAktif || waLoading) return
    setWaLoading(true)
    try {
      await Promise.allSettled([
        document.fonts.load("900 16px Lato"),
        document.fonts.load("700 16px Lato"),
        document.fonts.load("600 16px Lato"),
        document.fonts.load("400 16px Lato"),
        document.fonts.load("italic 400 16px Lato"),
      ])
      const loadImg = url => new Promise(res => {
        const img = new Image(); img.crossOrigin = "anonymous"
        img.onload = () => res(img); img.onerror = () => res(null); img.src = url
      })
      const [logoImg, masjidImg] = await Promise.all([
        loadImg(window.location.origin + "/logo-masjid.jpg"),
        loadImg(window.location.origin + "/masjid-bg.jpg"),
      ])

      const photoMap = {}
      const uniqueNames = [...new Set(
        (data.minggu || []).flatMap(m => (m.slots || []).map(s => s.penceramah)).filter(Boolean)
      )]
      await Promise.all(uniqueNames.map(async nama => {
        const pObj = semPenceramah.find(p => p.nama === nama)
        if (pObj?.gambar_url) photoMap[nama] = await loadImg(pObj.gambar_url)
      }))

      const [yr, mo] = bulanAktif.bulan.split("-").map(Number)
      const BNAM = ["","Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"]
      const HARI_LIST = ["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"]
      const bulanLabel = `${BNAM[mo]} ${yr}`
      const MINGGU_ORD = ["Pertama","Kedua","Ketiga","Keempat","Kelima","Keenam"]
      const LABEL_GENERIK = ["umum","am","tiada","-","–"]
      const WAKTU_C = { Subuh:"#4f46e5", Duha:"#d97706", Asar:"#ea580c", Jumaat:"#16a34a", Maghrib:"#b91c1c", Isyak:"#7c3aed" }
      const WAKTU_ORD = ["Subuh","Duha","Asar","Jumaat","Maghrib","Isyak"]
      const GOLD = "#c9a227", GOLDL = "#fcd34d"
      const goldRgba = a => `rgba(201,162,39,${a})`

      // Collect all slots for the month, group by program type
      const allSlots = (data.minggu || [])
        .flatMap(mg => mg.slots || [])
        .filter(s => s.penceramah && !s.kewanganSahaja && !s.ditangguhJadual && tarikhKeISO(s.tarikh, bulanAktif.bulan))
        .map(s => ({ ...s, _iso: tarikhKeISO(s.tarikh, bulanAktif.bulan) }))
        .sort((a, b) => a._iso !== b._iso ? a._iso.localeCompare(b._iso) : WAKTU_ORD.indexOf(a.waktu) - WAKTU_ORD.indexOf(b.waktu))

      const programMap = {}
      allSlots.forEach(s => { const p = getNamaProgram(s); if (!programMap[p]) programMap[p] = []; programMap[p].push(s) })

      const PROG_ORDER = ["Kuliah Subuh","Kuliah Duha","Kuliah Asar","Tazkirah Jumaat","Kuliah Maghrib","Kuliah Isyak","Kelas Muslimat","Majlis Zikir","Kelas Pegawai"]
      const programs = [...PROG_ORDER.filter(p => programMap[p]), ...Object.keys(programMap).filter(p => !PROG_ORDER.includes(p))]
      if (!programs.length) return

      const PROG_C = {
        "Kuliah Subuh":"#4f46e5","Kuliah Duha":"#d97706","Kuliah Asar":"#ea580c",
        "Tazkirah Jumaat":"#16a34a","Kuliah Maghrib":"#b91c1c","Kuliah Isyak":"#7c3aed",
        "Kelas Muslimat":"#db2777","Majlis Zikir":"#0891b2","Kelas Pegawai":"#475569"
      }

      // ── Layout constants — Landscape A4, 5-col program grid ──
      const CW = 1527, PH = 1080, HPAD = 32
      const HEADER_H = 112, FOOTER_H = 28
      const CONTENT_H = PH - HEADER_H - FOOTER_H
      const COLS = 5, COL_GAP = 8
      const COL_W = Math.floor((CW - HPAD * 2 - COL_GAP * (COLS - 1)) / COLS)
      const MAX_ROWS = 3, ROW_GAP = 8
      const SLOTS_PER_PAGE = COLS * MAX_ROWS
      const PHOTO_SZ = 150

      const { jsPDF } = await importSelamat(() => import("jspdf"))
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" })
      let pdfPageCount = 0

      function rrect(ctx, x, y, w, h, r) {
        ctx.beginPath()
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath()
      }
      function trunc(ctx, text, maxW) {
        if (!text || ctx.measureText(text).width <= maxW) return text || ""
        let t = text
        while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1)
        return t + "…"
      }
      function wrapText(ctx, text, maxW, maxLines) {
        const words = (text || "").split(" "); const lines = []; let line = ""
        for (const w of words) {
          const t = line ? line + " " + w : w
          if (ctx.measureText(t).width > maxW && line) { lines.push(line); if (lines.length >= maxLines) return lines; line = w }
          else line = t
        }
        if (line) lines.push(trunc(ctx, line, maxW))
        return lines
      }

      for (const prog of programs) {
        const progSlots = programMap[prog]
        const progColor = PROG_C[prog] || "#334155"
        const totalPages = Math.ceil(progSlots.length / SLOTS_PER_PAGE)

        for (let pi = 0; pi < totalPages; pi++) {
          const pageSlots = progSlots.slice(pi * SLOTS_PER_PAGE, (pi + 1) * SLOTS_PER_PAGE)
          const rowCount = Math.min(MAX_ROWS, Math.ceil(pageSlots.length / COLS))
          const ROW_H = Math.min(380, Math.floor((CONTENT_H - ROW_GAP * (rowCount - 1)) / rowCount))

          const canvas = document.createElement("canvas")
          canvas.width = CW; canvas.height = PH
          const ctx = canvas.getContext("2d")

          // ── Background ──
          if (masjidImg) {
            ctx.filter = "blur(10px)"
            const ia = masjidImg.naturalWidth / masjidImg.naturalHeight, ca = CW / PH
            let dw, dh, dx = 0, dy = 0
            if (ia > ca) { dh = PH + 20; dw = dh * ia; dx = (CW - dw) / 2 }
            else { dw = CW + 20; dh = dw / ia; dy = (PH - dh) / 2 }
            ctx.drawImage(masjidImg, dx, dy, dw, dh)
            ctx.filter = "none"
          }
          const ov = ctx.createLinearGradient(0, 0, 0, PH)
          ov.addColorStop(0, "rgba(4,10,24,0.93)"); ov.addColorStop(0.5, "rgba(5,12,28,0.89)"); ov.addColorStop(1, "rgba(4,10,24,0.94)")
          ctx.fillStyle = ov; ctx.fillRect(0, 0, CW, PH)

          // Subtle girih
          {
            const TS = 96, hS = TS / 2
            const patC = document.createElement("canvas"); patC.width = TS; patC.height = TS
            const pc = patC.getContext("2d")
            pc.strokeStyle = goldRgba(0.16); pc.lineWidth = 0.8
            const sR = TS * 0.295, sI = TS * 0.12
            pc.beginPath()
            for (let k = 0; k < 16; k++) {
              const a = (k * Math.PI / 8) - Math.PI / 2, r = k % 2 === 0 ? sR : sI
              k === 0 ? pc.moveTo(hS + Math.cos(a)*r, hS + Math.sin(a)*r) : pc.lineTo(hS + Math.cos(a)*r, hS + Math.sin(a)*r)
            }
            pc.closePath(); pc.stroke()
            const pat = ctx.createPattern(patC, "repeat")
            if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, CW, PH) }
          }

          ctx.fillStyle = GOLD; ctx.fillRect(0, 0, CW, 5); ctx.fillRect(0, PH - 5, CW, 5)
          ctx.save(); ctx.strokeStyle = goldRgba(0.22); ctx.lineWidth = 1; ctx.strokeRect(16, 16, CW - 32, PH - 32); ctx.restore()

          // ── Header ──
          if (logoImg) {
            ctx.save(); ctx.beginPath(); ctx.arc(CW / 2, 30, 20, 0, Math.PI * 2); ctx.clip()
            ctx.drawImage(logoImg, CW / 2 - 20, 10, 40, 40); ctx.restore()
            ctx.save(); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.65
            ctx.beginPath(); ctx.arc(CW / 2, 30, 22, 0, Math.PI * 2); ctx.stroke(); ctx.restore()
          }
          ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"
          ctx.font = "700 20px Lato"; ctx.fillText("BIRO PENDIDIKAN DAN DAKWAH", CW / 2, 64)
          ctx.fillStyle = "rgba(255,255,255,0.42)"; ctx.font = "400 11px Lato"
          ctx.fillText(data?.masjid || "Masjid Parit Setongkat", CW / 2, 78)

          const bandY = 84, bandH = 26
          const hbg = ctx.createLinearGradient(HPAD, 0, CW - HPAD, 0)
          hbg.addColorStop(0, progColor + "40"); hbg.addColorStop(0.5, progColor + "99"); hbg.addColorStop(1, progColor + "40")
          ctx.fillStyle = hbg; rrect(ctx, HPAD, bandY, CW - HPAD * 2, bandH, 8); ctx.fill()
          ctx.save(); ctx.strokeStyle = progColor + "cc"; ctx.lineWidth = 1; rrect(ctx, HPAD, bandY, CW - HPAD * 2, bandH, 8); ctx.stroke(); ctx.restore()
          const pgLabel = totalPages > 1 ? ` (${pi + 1}/${totalPages})` : ""
          ctx.fillStyle = GOLD; ctx.font = "700 16px Lato"; ctx.textAlign = "center"
          ctx.fillText(`${prog.toUpperCase()}${pgLabel}  —  ${bulanLabel.toUpperCase()}`, CW / 2, bandY + 18)

          // ── Slot cards: 5 per row ──
          pageSlots.forEach((s, idx) => {
            const col = idx % COLS
            const row = Math.floor(idx / COLS)
            const cardX = HPAD + col * (COL_W + COL_GAP)
            const cardY = HEADER_H + row * (ROW_H + ROW_GAP)
            const ph = photoMap[s.penceramah] || null
            const dObj = new Date(s._iso + "T00:00:00")
            const dayName = s.hari || HARI_LIST[dObj.getDay()]
            const dateNum = dObj.getDate()

            // Card bg + accent
            ctx.fillStyle = "rgba(7,16,38,0.82)"
            rrect(ctx, cardX, cardY, COL_W, ROW_H, 10); ctx.fill()
            ctx.fillStyle = progColor; ctx.fillRect(cardX + 8, cardY, COL_W - 16, 4)
            ctx.save(); ctx.strokeStyle = goldRgba(0.18); ctx.lineWidth = 1
            rrect(ctx, cardX, cardY, COL_W, ROW_H, 10); ctx.stroke(); ctx.restore()

            // Date section
            ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.font = "600 10px Lato"; ctx.textAlign = "left"
            ctx.fillText(dayName.toUpperCase(), cardX + 10, cardY + 18)
            ctx.fillStyle = "#ffffff"; ctx.font = "900 28px Lato"
            const dnW = ctx.measureText(String(dateNum)).width
            ctx.fillText(dateNum, cardX + 10, cardY + 46)
            ctx.fillStyle = "rgba(255,255,255,0.78)"; ctx.font = "700 13px Lato"
            ctx.fillText(BNAM[mo].toUpperCase(), cardX + 10 + dnW + 5, cardY + 46)

            // Divider
            ctx.save(); ctx.strokeStyle = goldRgba(0.28); ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(cardX + 10, cardY + 54); ctx.lineTo(cardX + COL_W - 10, cardY + 54); ctx.stroke(); ctx.restore()

            // Photo — square, centered
            const PS = Math.min(PHOTO_SZ, ROW_H - 120)
            const phX = cardX + Math.floor((COL_W - PS) / 2)
            const phY = cardY + 60
            ctx.save()
            rrect(ctx, phX, phY, PS, PS, 6); ctx.clip()
            if (ph) {
              const ia = ph.naturalWidth / ph.naturalHeight
              if (ia > 1) { const pdh = PS, pdw = pdh * ia; ctx.drawImage(ph, phX - (pdw - PS) / 2, phY, pdw, pdh) }
              else { const pdw = PS, pdh = pdw / ia; ctx.drawImage(ph, phX, phY - (pdh - PS) / 2, pdw, pdh) }
            } else {
              const gp = ctx.createRadialGradient(phX + PS / 2, phY + PS / 2, 0, phX + PS / 2, phY + PS / 2, PS / 2)
              gp.addColorStop(0, progColor + "55"); gp.addColorStop(1, progColor + "11")
              ctx.fillStyle = gp; ctx.fillRect(phX, phY, PS, PS)
              const ini = (s.penceramah || " ").split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase()
              ctx.fillStyle = goldRgba(0.9); ctx.font = `700 ${Math.floor(PS * 0.38)}px Lato`; ctx.textAlign = "center"
              ctx.fillText(ini, phX + PS / 2, phY + PS / 2 + Math.floor(PS * 0.14))
            }
            ctx.restore()
            ctx.save(); ctx.strokeStyle = goldRgba(0.45); ctx.lineWidth = 1
            rrect(ctx, phX, phY, PS, PS, 6); ctx.stroke(); ctx.restore()

            // Speaker name + pengisian — centered below photo
            const nameY = phY + PS + 14
            const txW = COL_W - 20
            ctx.font = "700 13px Lato"; ctx.textAlign = "center"
            const nameLines = wrapText(ctx, s.penceramah || "", txW, 2)
            ctx.fillStyle = "#ffffff"
            nameLines.forEach((line, li) => ctx.fillText(line, cardX + COL_W / 2, nameY + li * 15))
            const rawPg = getPengisian(s)
            const pgTxt = LABEL_GENERIK.includes(rawPg.trim().toLowerCase()) ? "" : rawPg
            if (pgTxt) {
              ctx.fillStyle = goldRgba(0.85); ctx.font = "italic 400 11px Lato"
              ctx.fillText(trunc(ctx, pgTxt, txW), cardX + COL_W / 2, nameY + nameLines.length * 15 + 4)
            }
          })

          // ── Footer ──
          const fy = PH - FOOTER_H
          ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.font = "italic 400 11px Lato"; ctx.textAlign = "center"
          ctx.fillText("*Tertakluk kepada perubahan tanpa notis awal", CW / 2, fy + 12)
          ctx.fillStyle = goldRgba(0.38); ctx.font = "400 11px Lato"
          ctx.fillText(`${bulanLabel}  •  Biro Pendidikan Dan Dakwah`, CW / 2, fy + 24)

          if (pdfPageCount > 0) pdf.addPage("a4", "landscape")
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 297, 210)
          pdfPageCount++
        }
      }

      const namaFail = `Jadual_WA_${bulanLabel.replace(/\s/g, "_")}.pdf`
      const blobUrl = pdf.output("bloburl")
      const pages = await renderPdfKeImej(pdf.output("arraybuffer"))
      setPraState({ url: blobUrl, namaFail, pages })
    } catch (err) {
      console.error("Ralat jana jadual WA:", err)
      alert(`Ralat: ${err?.message || String(err)}`)
    } finally {
      setWaLoading(false)
    }
  }

  function kemasTemplatSlot(gIdx, mIdx, field, val) {
    setTemplatData(d => { const c = d.map(g => ({ ...g, minggu: [...g.minggu.map(m => ({ ...m }))] })); c[gIdx].minggu[mIdx] = { ...c[gIdx].minggu[mIdx], [field]: field === "kadar" || field === "sarapan" ? Number(val) || 0 : val }; return c })
    setTemplatUbah(true)
  }
  function tambahTemplatMinggu(gIdx) {
    setTemplatData(d => { const c = d.map(g => ({ ...g, minggu: [...g.minggu.map(m => ({ ...m }))] })); const nextKe = (c[gIdx].minggu[c[gIdx].minggu.length - 1]?.ke || 0) + 1; c[gIdx].minggu.push({ ke: nextKe, penceramah: "", jenisProgram: "", pengisian: "", kadar: 100, sarapan: 0 }); return c })
    setTemplatUbah(true)
  }
  function padamTemplatMinggu(gIdx, mIdx) {
    setTemplatData(d => { const c = d.map(g => ({ ...g, minggu: [...g.minggu.map(m => ({ ...m }))] })); c[gIdx].minggu.splice(mIdx, 1); return c })
    setTemplatUbah(true)
  }
  function tambahTemplatGrup() {
    const { hari, waktu } = templFormGrup
    if (!hari || !waktu) return
    if (templatData.some(g => g.hari === hari && g.waktu === waktu)) return
    setTemplatData(d => [...d, { hari, waktu, minggu: [{ ke: 1, penceramah: "", jenisProgram: "", pengisian: "", kadar: 100, sarapan: 0 }] }])
    setTemplatUbah(true)
    setTemplTunjukFormGrup(false)
  }
  function padamTemplatGrup(gIdx) {
    setTemplatData(d => d.filter((_, i) => i !== gIdx))
    setTemplatUbah(true)
  }
  function simpanTemplat() {
    localStorage.setItem("alc_biro_templat", JSON.stringify(templatData))
    setTemplatUbah(false)
  }
  function resetTemplat() {
    const asal = migrasiTemplat(TEMPLATE_JADUAL.map(g => ({ ...g, minggu: g.minggu.map(m => ({ ...m })) })))
    setTemplatData(asal)
    localStorage.removeItem("alc_biro_templat")
    setTemplatUbah(false)
  }

  const inp = { padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, background: C.card, color: C.txt, width: "100%", boxSizing: "border-box" }
  const sel = { ...inp, cursor: "pointer" }

  // ── NAVBAR SHARED ──────────────────────────────────────────────────────────
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

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={navbarStyle}>
        <button onClick={onKembali} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1, fontWeight: "700", fontSize: 16, color: "white" }}>Biro Pendidikan</div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.navy}30`, borderTopColor: C.navy, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes anjakan-pulse{0%,100%{box-shadow:0 0 0 3px ${C.gold}60}50%{box-shadow:0 0 0 6px ${C.gold}30}}`}</style>
      </div>
    </div>
  )

  // ── SENARAI / DASHBOARD ────────────────────────────────────────────────────
  if (view === "senarai") return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
      {/* Navbar */}
      <div style={navbarStyle}>
        <div style={{ flex: 1, padding: "0 6px" }}>
          <div style={{ fontWeight: "700", fontSize: 16, color: "white" }}>Biro Pendidikan</div>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 0.5 }}>Masjid Parit Setongkat</div>
        </div>
        <button onClick={() => setModalLogKeluar(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <LogOut size={20} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      {/* Hero header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyDk} 100%)`, padding: "20px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(201,162,39,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, right: 30, width: 80, height: 80, borderRadius: "50%", background: "rgba(201,162,39,0.08)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/logo-masjid.jpg" alt="Logo" style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${C.gold}`, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none" }} />
          <div>
            <div style={{ fontSize: 11, color: C.gold, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Biro Pendidikan dan Dakwah</div>
            <div style={{ fontSize: 18, fontWeight: "800", color: "white", lineHeight: 1.2 }}>Masjid Parit Setongkat</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{new Date().toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 88px" }}>
        {notisAutoJana && (
          <div style={{ background: C.greenLt, border: `1px solid ${C.green}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <Check size={16} color={C.green} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: "700", color: C.green }}>Jadual auto-dijana</div>
              <div style={{ fontSize: 11, color: C.green, marginTop: 1 }}>{notisAutoJana} telah dijana dari templat</div>
            </div>
            <button onClick={() => setNotisAutoJana(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={14} color={C.green} /></button>
          </div>
        )}

        {/* Pengurusan */}
        <div style={{ fontSize: 11, fontWeight: "700", color: C.txtMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pengurusan</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          <button onClick={() => { setView("rujukan"); setTabRujukan("penceramah") }} style={{ padding: "16px 12px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, textAlign: "left" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: "700", color: C.txt }}>Rujukan</div>
              <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>Penceramah & kitab</div>
            </div>
          </button>
          <button onClick={() => setView("templat")} style={{ padding: "16px 12px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, textAlign: "left" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LayoutList size={18} color={C.green} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: "700", color: C.txt }}>Templat Jadual</div>
              <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>Jadual tetap mingguan</div>
            </div>
          </button>
        </div>

        {/* Rekod bulan */}
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
      </div>

      {/* Modal Bulan Baru */}
      {modalBulanBaru && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 24, width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontWeight: "800", fontSize: 16, color: C.txt, marginBottom: 16 }}>Bulan Baru</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.txtMuted, marginBottom: 5 }}>Pilih Bulan</div>
              <input type="month" value={formBulan.bulan} onChange={e => setFormBulan(p => ({ ...p, bulan: e.target.value }))} style={inp} />
              {formBulan.bulan && <div style={{ fontSize: 11, color: C.primary, marginTop: 4, fontWeight: "600" }}>{labelDariBulan(formBulan.bulan)}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.txtMuted, marginBottom: 7 }}>Kaedah Pengisian</div>
              {[
                { val: "template", icon: <Zap size={14} color={C.navy} />, label: "Jana dari Template", desc: "Isi semua slot automatik berdasarkan jadual tetap masjid" },
                { val: "kosong", icon: <FileText size={14} color={C.navy} />, label: "Mulakan kosong", desc: "Borang kosong tanpa sebarang slot" },
              ].map(opt => (
                <label key={opt.val} onClick={() => setFormBulan(p => ({ ...p, kaedah: opt.val }))} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 11px", borderRadius: 9, border: `1.5px solid ${formBulan.kaedah === opt.val ? C.navy : C.border}`, background: formBulan.kaedah === opt.val ? C.primaryLt : C.bg, cursor: "pointer", marginBottom: 7 }}>
                  <input type="radio" name="kaedah" value={opt.val} checked={formBulan.kaedah === opt.val} onChange={() => {}} style={{ marginTop: 3, accentColor: C.navy }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "600", color: C.txt, display: "flex", alignItems: "center", gap: 6 }}>{opt.icon} {opt.label}</div>
                    <div style={{ fontSize: 11, color: C.txtMuted, marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => { setModalBulanBaru(false); setFormBulan({ bulan: "", kaedah: "template" }) }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 13 }}>Batal</button>
              <button
                onClick={buatBulanBaru}
                disabled={!formBulan.bulan || simpanLoading}
                style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: C.navy, color: "white", cursor: "pointer", fontSize: 13, fontWeight: "700", opacity: (!formBulan.bulan || simpanLoading) ? 0.6 : 1 }}
              >
                {simpanLoading ? "Sedang jana..." : formBulan.kaedah === "template" ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Zap size={14} /> Jana Jadual</span> : "Buat Bulan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Padam Bulan */}
      {konfirmasiPadam && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <div style={{ background: C.card, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320, textAlign: "center" }}>
            <Trash2 size={32} color={C.danger} style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontWeight: "700", fontSize: 15, marginBottom: 8 }}>Padam {konfirmasiPadam.label}?</div>
            <div style={{ fontSize: 12, color: C.txtMuted, marginBottom: 20 }}>Semua data slot dan kewangan bulan ini akan dipadam.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setKonfirmasiPadam(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 13 }}>Batal</button>
              <button onClick={() => padamBulan(konfirmasiPadam.id)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: C.danger, color: "white", cursor: "pointer", fontSize: 13, fontWeight: "700" }}>Padam</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Log Keluar */}
      {modalLogKeluar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
          <form onSubmit={handleLogKeluar} style={{ background: C.card, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320, textAlign: "center" }}>
            <LogOut size={32} color={C.navy} style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontWeight: "700", fontSize: 15, marginBottom: 8 }}>Log Keluar?</div>
            <div style={{ fontSize: 12, color: C.txtMuted, marginBottom: 16 }}>Sahkan kata laluan untuk log keluar.</div>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <input
                type={tunjukPasswordLogKeluar ? "text" : "password"}
                placeholder="Kata Laluan"
                value={passwordLogKeluar}
                autoFocus
                onChange={e => { setPasswordLogKeluar(e.target.value); setRalatLogKeluar("") }}
                style={{ ...inp, padding: "10px 40px 10px 12px", fontSize: 13 }}
              />
              <button type="button" onClick={() => setTunjukPasswordLogKeluar(v => !v)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: C.txtMuted, display: "flex" }}>
                {tunjukPasswordLogKeluar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {ralatLogKeluar && <div style={{ fontSize: 12, color: C.danger, marginBottom: 8 }}>{ralatLogKeluar}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => { setModalLogKeluar(false); setPasswordLogKeluar(""); setRalatLogKeluar("") }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 13 }}>Batal</button>
              <button type="submit" disabled={loadingLogKeluar} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: C.navy, color: "white", cursor: loadingLogKeluar ? "default" : "pointer", fontSize: 13, fontWeight: "700", opacity: loadingLogKeluar ? 0.7 : 1 }}>
                {loadingLogKeluar ? "Menyemak…" : "Log Keluar"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )

  // ── RUJUKAN ────────────────────────────────────────────────────────────────
  if (view === "rujukan") return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
      <div style={navbarStyle}>
        <button onClick={() => setView("senarai")} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: 16, color: "white" }}>Rujukan</div>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 0.5 }}>Penceramah & Pengisian</div>
        </div>
      </div>
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {[{ key: "penceramah", icon: <Users size={14} />, label: "Penceramah" }, { key: "pengisian", icon: <BookOpen size={14} />, label: "Pengisian & Kitab" }].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTabRujukan(key)} style={{ flex: 1, padding: "11px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: "700", color: tabRujukan === key ? C.navy : C.txtMuted, borderBottom: tabRujukan === key ? `3px solid ${C.navy}` : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            {icon} {label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 88px" }}>
        {tabRujukan === "penceramah" && (<>
          {semPenceramah.length === 0 && (
            <button onClick={muatPenceramahSediaAda} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: C.navy, color: "white", cursor: "pointer", fontWeight: "700", fontSize: 13, marginBottom: 10 }}>
              Muat Senarai Penceramah Sedia Ada ({PENCERAMAH_SEDIA_ADA.length} orang)
            </button>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input value={penceramahBaru} onChange={e => setPenceramahBaru(e.target.value)} placeholder="Nama penceramah baru..." onKeyDown={e => e.key === "Enter" && tambahPenceramah()} style={{ ...inp, flex: 1 }} />
            <button onClick={tambahPenceramah} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.navy, color: "white", cursor: "pointer", fontWeight: "700", fontSize: 13, whiteSpace: "nowrap" }}>+ Tambah</button>
          </div>
          {semPenceramah.map(p => {
            const isEdit = editPenceramah?.id === p.id
            return (
              <div key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", padding: "10px 4px", gap: 8, cursor: "pointer" }} onClick={() => setEditPenceramah(isEdit ? null : { id: p.id, nama: p.nama, gambar_url: p.gambar_url || "", no_tel: p.no_tel || "", pengisian_list: p.pengisian_list?.length ? [...p.pengisian_list] : [{ pengisian: "", kitab: "" }] })}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    {p.gambar_url && <img src={p.gambar_url} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}`, flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: "600", color: p.aktif ? C.txt : C.txtMuted, textDecoration: p.aktif ? "none" : "line-through" }}>{p.nama}</div>
                      {!isEdit && p.pengisian_list?.filter(x => x.pengisian || kitabTeks(x)).map((x, i) => <div key={i} style={{ fontSize: 10, color: C.txtMuted, marginTop: i === 0 ? 2 : 1 }}>{[x.pengisian, kitabTeks(x)].filter(Boolean).join(" – ")}</div>)}
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); togolPenceramah(p.id, p.aktif) }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${p.aktif ? C.border : C.primary}`, background: p.aktif ? C.card : `${C.primary}15`, cursor: "pointer", fontSize: 11, color: p.aktif ? C.txtMuted : C.primary, fontWeight: "600", flexShrink: 0 }}>
                    {p.aktif ? "Nyahaktif" : "Aktifkan"}
                  </button>
                  {isEdit ? <ChevronDown size={14} color={C.txtMuted} style={{ flexShrink: 0 }} /> : <ChevronRight size={14} color={C.txtMuted} style={{ flexShrink: 0 }} />}
                </div>
                {isEdit && (
                  <div style={{ padding: "8px 4px 12px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Nama</div>
                      <input value={editPenceramah.nama} onChange={e => setEditPenceramah(p => ({ ...p, nama: e.target.value }))} style={inp} />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 4 }}>Gambar Penceramah</div>
                      {editPenceramah.gambar_url ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={editPenceramah.gambar_url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                          <button onClick={() => setEditPenceramah(p => ({ ...p, gambar_url: "" }))} style={{ fontSize: 11, color: C.danger, background: "none", border: "none", cursor: "pointer" }}>Buang gambar</button>
                        </div>
                      ) : (
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1.5px dashed ${C.border}`, borderRadius: 8, padding: "7px 12px", cursor: gambarUploadLoading ? "not-allowed" : "pointer", fontSize: 12, color: C.primary }}>
                          <Upload size={13} />{gambarUploadLoading === editPenceramah.id ? "Memuat naik..." : "Muat naik gambar"}
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleGambarUpload(e, editPenceramah.id)} disabled={!!gambarUploadLoading} />
                        </label>
                      )}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 4 }}>No. Telefon</div>
                      <input value={editPenceramah.no_tel || ""} onChange={e => setEditPenceramah(p => ({ ...p, no_tel: e.target.value }))} placeholder="cth: 0123456789" style={inp} />
                    </div>
                    <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 5 }}>Pengisian &amp; Kitab</div>
                    <datalist id="biro-pengisian-jenis-ruj">{senaraiPengisian.map(x => <option key={x.id} value={x.nilai} />)}</datalist>
                    <datalist id="biro-kitab-list-ruj">{senaraiKitab.map(x => <option key={x.id} value={x.nilai} />)}</datalist>
                    {editPenceramah.pengisian_list.map((item, idx) => (
                      <div key={idx} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px", marginBottom: 6 }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: C.txtMuted, marginBottom: 2 }}>Pengisian</div>
                            <input value={item.pengisian} onChange={e => editPgList(idx, "pengisian", e.target.value)} placeholder="cth: Tasauf" list="biro-pengisian-jenis-ruj" style={{ ...inp, fontSize: 12 }} />
                          </div>
                          <button onClick={() => removePgList(idx)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: C.danger, flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}><X size={14} /></button>
                        </div>
                        <div style={{ fontSize: 9, color: C.txtMuted, marginBottom: 2 }}>Kitab / Nota</div>
                        {(Array.isArray(item.kitab) ? item.kitab : [item.kitab || ""]).map((k, kIdx, arr) => (
                          <div key={kIdx} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                            <input value={k} onChange={e => editPgKitab(idx, kIdx, e.target.value)} placeholder="cth: Kitab Mukashafah Al-Qulub" list="biro-kitab-list-ruj" style={{ ...inp, fontSize: 12, flex: 1 }} />
                            {arr.length > 1 && <button onClick={() => removePgKitab(idx, kIdx)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: C.danger, flexShrink: 0 }}><X size={14} /></button>}
                          </div>
                        ))}
                        <button onClick={() => addPgKitab(idx)} style={{ padding: "3px 8px", borderRadius: 6, border: `1px dashed ${C.border}`, background: "none", cursor: "pointer", fontSize: 11, color: C.primary }}>+ Tambah Kitab</button>
                      </div>
                    ))}
                    <button onClick={addPgList} style={{ width: "100%", padding: "7px", borderRadius: 8, border: `1.5px dashed ${C.border}`, background: "none", cursor: "pointer", fontSize: 12, color: C.primary, marginBottom: 10 }}>+ Tambah Pengisian</button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { if (window.confirm(`Padam "${editPenceramah.nama}"?`)) padamPenceramah(editPenceramah.id) }} style={{ padding: "7px 10px", borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: C.danger, display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                      <button onClick={() => setEditPenceramah(null)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 12 }}>Batal</button>
                      <button onClick={() => kemasKiniPenceramah(editPenceramah.id, { nama: editPenceramah.nama, pengisian_list: editPenceramah.pengisian_list, gambar_url: editPenceramah.gambar_url || null, no_tel: editPenceramah.no_tel || null })} style={{ flex: 2, padding: "7px", borderRadius: 8, border: "none", background: C.navy, color: "white", cursor: "pointer", fontSize: 12, fontWeight: "700" }}>Simpan</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </>)}
        {tabRujukan === "pengisian" && (<>
          {[["pengisian", "Pengisian", senaraiPengisian, "cth: Tasauf"], ["kitab", "Kitab", senaraiKitab, "cth: Kitab Mukashafah Al-Qulub"]].map(([jenis, label, senarai, ph]) => (
            <div key={jenis} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: "700", color: C.navy, marginBottom: 8 }}>{label} <span style={{ color: C.txtMuted, fontWeight: "400" }}>({senarai.length})</span></div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={inputSenarai[jenis]} onChange={e => setInputSenarai(p => ({ ...p, [jenis]: e.target.value }))} onKeyDown={e => e.key === "Enter" && tambahSenarai(jenis)} placeholder={ph} style={{ ...inp, flex: 1 }} />
                <button onClick={() => tambahSenarai(jenis)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.navy, color: "white", cursor: "pointer", fontWeight: "700", fontSize: 13, whiteSpace: "nowrap" }}>+ Tambah</button>
              </div>
              {senarai.map(item => {
                const isEdit = editSenarai?.id === item.id
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 4px", borderBottom: `1px solid ${C.border}` }}>
                    {isEdit ? (<>
                      <input value={editSenarai.nilai} onChange={e => setEditSenarai(p => ({ ...p, nilai: e.target.value }))} onKeyDown={e => e.key === "Enter" && kemasSenarai(item.id, jenis, editSenarai.nilai)} autoFocus style={{ ...inp, flex: 1, fontSize: 12 }} />
                      <button onClick={() => kemasSenarai(item.id, jenis, editSenarai.nilai)} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: C.green, color: "white", cursor: "pointer", fontSize: 11, fontWeight: "700" }}>Simpan</button>
                      <button onClick={() => setEditSenarai(null)} style={{ padding: "5px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 11 }}>Batal</button>
                    </>) : (<>
                      <div style={{ flex: 1, fontSize: 13, color: C.txt }}>{item.nilai}</div>
                      <button onClick={() => setEditSenarai({ id: item.id, nilai: item.nilai })} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 11, color: C.primary, fontWeight: "600" }}>Edit</button>
                      <button onClick={() => padamSenarai(item.id, jenis)} style={{ padding: "4px 6px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: C.danger, display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                    </>)}
                  </div>
                )
              })}
            </div>
          ))}
        </>)}
      </div>
    </div>
  )

  // ── TEMPLAT JADUAL ─────────────────────────────────────────────────────────
  if (view === "templat") return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>
      <div style={navbarStyle}>
        <button onClick={() => setView("senarai")} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: 16, color: "white" }}>Templat Jadual</div>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 0.5 }}>{templatUbah ? "● Belum disimpan" : "Jadual tetap mingguan"}</div>
        </div>
        {templatUbah && (
          <button onClick={simpanTemplat} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.green, color: "white", cursor: "pointer", fontSize: 12, fontWeight: "700", flexShrink: 0 }}>Simpan</button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 88px" }}>
        <datalist id="biro-penceramah-tmpl">{semPenceramah.map(p => <option key={p.id} value={p.nama} />)}</datalist>
        {templatData.map((grup, gIdx) => {
          const gKey = `${grup.hari}-${grup.waktu}`
          const terbuka = !!templatExpandGrup[gKey]
          return (
            <div key={gKey} style={{ marginBottom: 10, borderRadius: 10, overflow: "hidden", border: `1px solid ${terbuka ? `${C.navy}40` : C.border}` }}>
              <div style={{ background: terbuka ? C.navy : C.card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setTemplatExpandGrup(p => ({ ...p, [gKey]: !terbuka }))}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "700", fontSize: 13, color: terbuka ? "white" : C.txt }}>{grup.hari} — {grup.waktu}</div>
                  <div style={{ fontSize: 10, color: terbuka ? "rgba(255,255,255,0.6)" : C.txtMuted, marginTop: 1 }}>{grup.minggu.length} slot minggu</div>
                </div>
                {terbuka ? <ChevronDown size={16} color="white" /> : <ChevronRight size={16} color={C.txtMuted} />}
              </div>
              {terbuka && (
                <div style={{ background: C.bg }}>
                  {grup.minggu.map((m, mIdx) => (
                    <div key={mIdx} style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, background: C.card }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: C.navy, fontWeight: "700", background: C.primaryLt, padding: "2px 7px", borderRadius: 4 }}>Minggu {m.ke}</div>
                        <button onClick={() => padamTemplatMinggu(gIdx, mIdx)} style={{ marginLeft: "auto", padding: "3px 6px", borderRadius: 6, border: "none", background: "none", cursor: "pointer", color: C.danger, display: "flex", alignItems: "center" }}><Trash2 size={13} /></button>
                      </div>
                      <input value={m.penceramah} onChange={e => {
                        const nama = e.target.value
                        kemasTemplatSlot(gIdx, mIdx, "penceramah", nama)
                        const profil = cariPenceramah(nama)
                        const pgl = (profil?.pengisian_list || []).filter(x => x.pengisian || kitabTeks(x))
                        if (pgl.length === 1) kemasTemplatSlot(gIdx, mIdx, "pengisian", [pgl[0].pengisian, kitabTeks(pgl[0])].filter(Boolean).join(" – "))
                        else if (pgl.length > 1) kemasTemplatSlot(gIdx, mIdx, "pengisian", "")
                      }} placeholder="Penceramah..." list="biro-penceramah-tmpl" style={{ ...inp, marginBottom: 5 }} />
                      <select value={m.jenisProgram || ""} onChange={e => kemasTemplatSlot(gIdx, mIdx, "jenisProgram", e.target.value)} style={{ ...inp, marginBottom: 5 }}>
                        <option value="">— {DEFAULT_PROGRAM[grup.waktu] || "Pilih Program"} —</option>
                        {PROGRAM_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {(() => {
                        const profil = cariPenceramah(m.penceramah)
                        const pgl = (profil?.pengisian_list || []).filter(x => x.pengisian || kitabTeks(x))
                        if (pgl.length === 1) return <div style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, background: C.bg, color: C.txt, marginBottom: 5 }}>{[pgl[0].pengisian, kitabTeks(pgl[0])].filter(Boolean).join(" – ") || "—"}</div>
                        if (pgl.length > 1) return (
                          <select value={m.pengisian} onChange={e => kemasTemplatSlot(gIdx, mIdx, "pengisian", e.target.value)} style={{ ...inp, marginBottom: 5 }}>
                            <option value="">— Pilih pengisian —</option>
                            {pgl.map((x, i) => { const v = [x.pengisian, kitabTeks(x)].filter(Boolean).join(" – "); return <option key={i} value={v}>{v}</option> })}
                          </select>
                        )
                        return <input value={m.pengisian} onChange={e => kemasTemplatSlot(gIdx, mIdx, "pengisian", e.target.value)} placeholder="Pengisian / Topik..." style={{ ...inp, marginBottom: 5 }} />
                      })()}
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: C.txtMuted, marginBottom: 2 }}>Saguhati (RM)</div>
                          <input type="number" value={m.kadar} onChange={e => kemasTemplatSlot(gIdx, mIdx, "kadar", e.target.value)} onFocus={e => e.target.select()} style={{ ...inp, fontSize: 12 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 9, color: C.txtMuted, marginBottom: 2 }}>Sarapan (RM)</div>
                          <input type="number" value={m.sarapan} onChange={e => kemasTemplatSlot(gIdx, mIdx, "sarapan", e.target.value)} onFocus={e => e.target.select()} style={{ ...inp, fontSize: 12 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => tambahTemplatMinggu(gIdx)} style={{ width: "100%", padding: "9px", border: "none", borderTop: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", fontSize: 12, color: C.navy, fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Plus size={13} /> Tambah Minggu
                  </button>
                  <button onClick={() => { if (window.confirm(`Padam slot ${grup.hari} — ${grup.waktu}?`)) padamTemplatGrup(gIdx) }} style={{ width: "100%", padding: "7px", border: "none", borderTop: `1px solid ${C.border}`, background: C.dangerLt, cursor: "pointer", fontSize: 11, color: C.danger }}>
                    Padam Slot Ini
                  </button>
                </div>
              )}
            </div>
          )
        })}

        <div style={{ marginTop: 16 }}>
          {templTunjukFormGrup ? (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontWeight: "700", fontSize: 13, color: C.txt, marginBottom: 12 }}>Tambah Slot Tetap Baru</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.txtMuted, marginBottom: 4 }}>Hari</div>
                  <select value={templFormGrup.hari} onChange={e => setTemplFormGrup(p => ({ ...p, hari: e.target.value }))} style={{ ...sel, width: "100%" }}>
                    {["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"].map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.txtMuted, marginBottom: 4 }}>Waktu</div>
                  <select value={templFormGrup.waktu} onChange={e => setTemplFormGrup(p => ({ ...p, waktu: e.target.value }))} style={{ ...sel, width: "100%" }}>
                    {["Subuh","Duha","Jumaat","Maghrib","Isyak"].map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setTemplTunjukFormGrup(false)} style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 13 }}>Batal</button>
                <button onClick={tambahTemplatGrup} style={{ flex: 2, padding: "9px", borderRadius: 9, border: "none", background: C.navy, color: "white", cursor: "pointer", fontSize: 13, fontWeight: "700" }}>+ Tambah</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setTemplTunjukFormGrup(true)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `2px dashed ${C.navy}50`, background: "transparent", cursor: "pointer", fontSize: 13, color: C.navy, fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Plus size={16} /> Tambah Slot Tetap Baru
            </button>
          )}
        </div>

        <button onClick={() => { if (window.confirm("Reset semua templat ke asal? Perubahan yang dibuat akan hilang.")) resetTemplat() }} style={{ width: "100%", padding: "10px", marginTop: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 12, color: C.txtMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <RotateCcw size={13} /> Reset ke Templat Asal
        </button>
      </div>
    </div>
  )

  // ── BULAN EDIT ─────────────────────────────────────────────────────────────
  if (view === "bulan" && data) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {pratontonPoster && (
        <div
          onClick={() => setPratontonPoster(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 10000,
                   display: "flex", flexDirection: "column", alignItems: "center",
                   justifyContent: "center", gap: 16 }}
        >
          <img
            src={pratontonPoster.dataUrl}
            alt="Preview Poster"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "92vw", maxHeight: "78vh", borderRadius: 8,
                     boxShadow: "0 8px 40px rgba(0,0,0,0.6)", display: "block" }}
          />
          <div onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", maxWidth: "92vw", textAlign: "center", wordBreak: "break-all" }}>
            {pratontonPoster.filename}
          </div>
          <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setPratontonPoster(null)}
              style={{ padding: "10px 28px", borderRadius: 8, border: "1.5px solid #6b7280",
                       background: "#374151", color: "#fff", cursor: "pointer",
                       fontSize: 14, fontWeight: 600 }}
            >
              Tutup
            </button>
            <a
              href={pratontonPoster.dataUrl}
              download={pratontonPoster.filename}
              onClick={() => setPratontonPoster(null)}
              style={{ padding: "10px 28px", borderRadius: 8, border: "none",
                       background: "#7c3aed", color: "#fff", cursor: "pointer",
                       fontSize: 14, fontWeight: 700, textDecoration: "none",
                       display: "flex", alignItems: "center", gap: 6 }}
            >
              ⬇ Muat Turun
            </a>
            {pratontonPoster.isKad && (
              <button
                onClick={() => {
                  const { namaPenceramah: np, noTel, bulanLabel, takwimLabel: tl, dataUrl, filename: fn } = pratontonPoster
                  const sapaanPrefix = np.includes("Ustazah") ? "Ustazah" : "Ustaz"
                  const jenisTakwim = (tl || "TAKWIM KULIAH").replace("TAKWIM ", "").toLowerCase()
                  const mesej = `Assalamualaikum ${sapaanPrefix}, berikut disertakan takwim ${jenisTakwim} bulan ${bulanLabel} sebagai rujukan. Jika terdapat sebarang perubahan, mohon maklumkan kepada saya lebih awal. Terima kasih ${sapaanPrefix}.`
                  const no = (noTel || "").replace(/[^0-9]/g, "").replace(/^0/, "60")
                  if (!no) { alert("Sila tambah no. telefon dalam profil penceramah."); return }
                  // Buka chat ustaz terus dengan teks pre-filled
                  window.open(`https://wa.me/${no}?text=${encodeURIComponent(mesej)}`, "_blank")
                  // Auto-download image supaya boleh dilampirkan dalam chat
                  const a = document.createElement("a"); a.href = dataUrl; a.download = fn
                  document.body.appendChild(a); a.click(); document.body.removeChild(a)
                }}
                style={{ padding: "10px 20px", borderRadius: 8, border: "none",
                         background: "#25D366", color: "#fff", cursor: "pointer",
                         fontSize: 14, fontWeight: 700 }}
              >
                📲 Kongsi
              </button>
            )}
          </div>
        </div>
      )}
      {pratontonBendahari && bendahariLink && (
        <div style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#1e3a5f", flexShrink: 0 }}>
            <button onClick={() => setPratontonBendahari(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 7, color: "white", cursor: "pointer", padding: "5px 10px", fontSize: 12, fontWeight: "600", display: "flex", alignItems: "center", gap: 5 }}>
              <ArrowLeft size={14} /> Tutup Pratonton
            </button>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>Paparan Bendahari</span>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <LaporanBendahari
              token={bendahariLink.split("bendahari=")[1]}
              onAdminLogin={() => setPratontonBendahari(false)}
              hideFab
            />
          </div>
        </div>
      )}
      {/* Navbar */}
      <div style={navbarStyle}>
        <button onClick={() => { setView("senarai"); setData(null); setBulanAktif(null) }} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: 15, color: "white" }}>{bulanAktif?.label}</div>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 0.5 }}>Biro Pendidikan dan Dakwah</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: "600", paddingRight: 8, color: simpanLoading ? C.gold : adaUbah ? C.gold : C.green }}>
          {simpanLoading ? "Menyimpan..." : adaUbah ? "● Belum simpan" : "✓ Tersimpan"}
        </div>
        <button onClick={() => setModalTetapanMasa(true)} title="Tetapan Masa Waktu" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", display: "flex", alignItems: "center", color: "white" }}>
          <Settings size={18} />
        </button>
      </div>

      {/* Tab selector */}
      <div style={{ display: "flex", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {[{ key: "jadual", icon: <Calendar size={14} />, label: "Jadual" }, { key: "kewangan", icon: <Wallet size={14} />, label: "Laporan" }].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "11px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: "700", color: tab === key ? C.navy : C.txtMuted, borderBottom: tab === key ? `3px solid ${C.navy}` : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 88px" }}>

        {/* ── TAB JADUAL ── */}
        {tab === "jadual" && (
          <>
          {data.minggu.map((minggu, mIdx) => {
          const buka = !!mingguBuka[mIdx]
          return (
            <div key={minggu.id || mIdx} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
              <div style={{ background: C.navy, display: "flex", alignItems: "center", padding: "8px 12px", gap: 8 }}>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setMingguBuka(p => ({ ...p, [mIdx]: !buka }))}>
                  <div style={{ color: "white", fontWeight: "700", fontSize: 13 }}>Minggu {mIdx + 1}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{minggu.slots.filter(s => !s.kewanganSahaja).length} slot kuliah</div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {buka ? <ChevronDown size={16} color="white" style={{ cursor: "pointer" }} onClick={() => setMingguBuka(p => ({ ...p, [mIdx]: false }))} />
                        : <ChevronRight size={16} color="white" style={{ cursor: "pointer" }} onClick={() => setMingguBuka(p => ({ ...p, [mIdx]: true }))} />}
                </div>
              </div>
              {buka && (
                <div style={{ padding: "10px 10px 6px" }}>
                  {minggu.slots.map((slot, sIdx) => {
                    const isExp = expandSlot === slot.id
                    const isLepas = (() => {
                      if (slot.ditangguhJadual) return false
                      const iso = tarikhKeISO(slot.tarikh, bulanAktif?.bulan)
                      if (!iso) return false
                      const now = new Date()
                      const slotDay = new Date(iso + "T00:00:00")
                      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                      if (slotDay < todayStart) return true
                      if (slotDay > todayStart) return false
                      return now.getHours() >= (WAKTU_CUTOFF_HOUR[slot.waktu] || 23)
                    })()
                    return (
                      <div key={slot.id} style={{ border: isExp ? `1.5px solid ${C.navy}` : isLepas ? `1px solid ${C.green}80` : `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, overflow: "hidden", background: slot.kewanganSahaja ? C.warningLt : isLepas ? C.greenLt : C.bg }}>
                        <div style={{ display: "flex", alignItems: "center", padding: "8px 10px", gap: 8, background: isExp ? C.primaryLt : isLepas ? C.greenLt : "transparent", borderBottom: isExp ? `1px solid ${C.border}` : "none" }}>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 0 }} onClick={() => { setExpandSlot(isExp ? null : slot.id); setMenuSlot(null) }}>
                            <div style={{ minWidth: 38 }}>
                              <div style={{ fontSize: 11, fontWeight: "700", color: C.navy }}>{formatTarikh(slot.tarikh) || "—"}</div>
                              <div style={{ fontSize: 9, color: C.txtMuted }}>{slot.hari}</div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: "600", padding: "1px 5px", borderRadius: 4, background: waktuWarna[slot.waktu] || C.bg, color: waktuText[slot.waktu] || C.txtMuted, whiteSpace: "nowrap" }}>{slot.waktu}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <div style={{ fontSize: 11, fontWeight: "600", color: slot.ditangguhJadual ? C.danger : C.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slot.penceramah || <span style={{ color: C.txtMuted }}>Penceramah...</span>}</div>
                                {isLepas && <span style={{ fontSize: 9, fontWeight: "700", padding: "1px 5px", borderRadius: 4, background: C.greenLt, color: C.green, whiteSpace: "nowrap", flexShrink: 0 }}>✓ Lepas</span>}
                                {slot.ditangguhJadual && <span style={{ fontSize: 9, fontWeight: "700", padding: "1px 5px", borderRadius: 4, background: C.dangerLt, color: C.danger, whiteSpace: "nowrap", flexShrink: 0 }}>Tangguh</span>}
                                {slot.kewanganSahaja && <span style={{ fontSize: 9, fontWeight: "700", padding: "1px 5px", borderRadius: 4, background: C.warningLt, color: C.warning, whiteSpace: "nowrap", flexShrink: 0 }}>Kew.</span>}
                              </div>
                              <div style={{ fontSize: 10, color: C.txtMuted, wordBreak: "break-word" }}>{getPengisian(slot) || "—"}</div>
                            </div>
                            {isExp ? <ChevronDown size={14} color={C.navy} /> : <ChevronRight size={14} color={C.txtMuted} />}
                          </div>
                          <button onClick={e => { e.stopPropagation(); if (menuSlot === slot.id) { setMenuSlot(null); setPadamKonfirmSlot(null) } else { setMenuSlot(slot.id); setPadamKonfirmSlot(null) } }} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: C.txtMuted, display: "flex", alignItems: "center", flexShrink: 0 }}>
                            <MoreVertical size={15} />
                          </button>
                        </div>

                        {menuSlot === slot.id && (
                          padamKonfirmSlot === slot.id ? (
                            <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 12px", background: C.dangerLt, display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ flex: 1, fontSize: 12, color: C.danger }}>Padam slot ini?</span>
                              <button onClick={() => { kemas(d => { d.minggu[mIdx].slots.splice(sIdx, 1) }); setMenuSlot(null); setPadamKonfirmSlot(null); setExpandSlot(null) }} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: C.danger, color: "white", cursor: "pointer", fontSize: 12, fontWeight: "700" }}>Padam</button>
                              <button onClick={() => { setMenuSlot(null); setPadamKonfirmSlot(null) }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 12 }}>Batal</button>
                            </div>
                          ) : (
                            <div style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
                              <button onClick={() => { const baru = slotKosong(); kemas(d => { d.minggu[mIdx].slots.splice(sIdx + 1, 0, baru) }); setExpandSlot(baru.id); setMenuSlot(null) }} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.navy, display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                                <Plus size={13} /> Tambah slot di bawah
                              </button>
                              <div style={{ height: 1, background: C.border, margin: "0 12px" }} />
                              <button onClick={() => setPadamKonfirmSlot(slot.id)} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.danger, display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                                <Trash2 size={13} /> Padam slot ini
                              </button>
                            </div>
                          )
                        )}

                        {isExp && (
                          <div style={{ padding: "10px", borderTop: `1px solid ${C.border}`, background: C.card, display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <div>
                                <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Tarikh</div>
                                <input type="date" value={tarikhKeISO(slot.tarikh, bulanAktif?.bulan)} onChange={e => { const v = e.target.value; kemas(d => { const s = d.minggu[mIdx].slots.find(s => s.id === slot.id); if (s) { s.tarikh = v; if (v) s.hari = DOW_HARI[new Date(v + "T00:00:00").getDay()] } }) }} style={inp} />
                              </div>
                              <div>
                                <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Waktu</div>
                                <select value={slot.waktu} onChange={e => { kemasSlot(mIdx, slot.id, "waktu", e.target.value); kemasSlot(mIdx, slot.id, "jenisProgram", "") }} style={sel}>
                                  {WAKTU_OPTS.map(w => <option key={w}>{w}</option>)}
                                </select>
                              </div>
                              <div>
                                <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Jenis Program</div>
                                <select value={slot.jenisProgram || ""} onChange={e => kemasSlot(mIdx, slot.id, "jenisProgram", e.target.value)} style={sel}>
                                  <option value="">— {DEFAULT_PROGRAM[slot.waktu] || "Pilih Program"} —</option>
                                  {PROGRAM_OPTS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Masa (pilihan — kosongkan untuk guna tetapan lalai {slot.waktu})</div>
                              <input value={slot.masaKustom || ""} onChange={e => kemasSlot(mIdx, slot.id, "masaKustom", e.target.value)} placeholder={masaWaktu[slot.waktu] || ""} style={inp} />
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Penceramah</div>
                              <select value={cariPenceramah(slot.penceramah)?.nama ?? slot.penceramah} onChange={e => {
                                if (e.target.value === "__baru__") { setModalPenceramah(true); return }
                                const nama = e.target.value
                                kemasSlot(mIdx, slot.id, "penceramah", nama)
                                const profil = cariPenceramah(nama)
                                const pgl = (profil?.pengisian_list || []).filter(x => x.pengisian || kitabTeks(x))
                                if (pgl.length === 1) {
                                  kemasSlot(mIdx, slot.id, "pengisian", [pgl[0].pengisian, kitabTeks(pgl[0])].filter(Boolean).join(" – "))
                                } else if (pgl.length > 1) {
                                  kemasSlot(mIdx, slot.id, "pengisian", "")
                                }
                              }} style={sel}>
                                <option value="">— Pilih penceramah —</option>
                                {slot.penceramah && !cariPenceramah(slot.penceramah) && <option value={slot.penceramah}>{slot.penceramah} ⚠️</option>}
                                {penceramahList.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
                                <option value="__baru__">＋ Tambah Penceramah Baru...</option>
                              </select>
                            </div>
                            {(() => {
                              const profil = cariPenceramah(slot.penceramah)
                              const pgl = (profil?.pengisian_list || []).filter(x => x.pengisian || kitabTeks(x))
                              if (pgl.length === 1 && !slot.programRasmi) {
                                return (
                                  <div>
                                    <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Pengisian / Kitab</div>
                                    <div style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, background: C.bg, color: C.txt }}>
                                      {[pgl[0].pengisian, kitabTeks(pgl[0])].filter(Boolean).join(" – ") || "—"}
                                    </div>
                                  </div>
                                )
                              }
                              if (pgl.length > 1 && !slot.programRasmi) {
                                return (
                                  <div>
                                    <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Pengisian / Kitab</div>
                                    <select value={slot.pengisian} onChange={e => kemasSlot(mIdx, slot.id, "pengisian", e.target.value)} style={sel}>
                                      <option value="">— Pilih pengisian —</option>
                                      {pgl.map((x, i) => { const v = [x.pengisian, kitabTeks(x)].filter(Boolean).join(" – "); return <option key={i} value={v}>{v}</option> })}
                                    </select>
                                  </div>
                                )
                              }
                              return (
                                <div>
                                  <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Tajuk Pengisian / Kitab</div>
                                  <input value={slot.pengisian} onChange={e => kemasSlot(mIdx, slot.id, "pengisian", e.target.value)} placeholder="cth: Sirah Nabawiyah" style={inp} />
                                </div>
                              )
                            })()}
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.txtMuted, cursor: "pointer", userSelect: "none" }}>
                              <input type="checkbox" checked={!!slot.muslimat} onChange={e => kemasSlot(mIdx, slot.id, "muslimat", e.target.checked)} style={{ width: 14, height: 14 }} />
                              Tiada Saguhati
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.txtMuted, cursor: "pointer", userSelect: "none" }}>
                              <input type="checkbox" checked={!!slot.solatTasbih} onChange={e => kemasSlot(mIdx, slot.id, "solatTasbih", e.target.checked)} style={{ width: 14, height: 14 }} />
                              Ada Solat Tasbih Sebelum Kuliah
                            </label>

                            <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 8 }}>
                              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: slot.ditangguhJadual ? C.danger : C.txtMuted, cursor: "pointer", userSelect: "none", fontWeight: slot.ditangguhJadual ? "600" : "normal" }}>
                                <input type="checkbox" checked={!!slot.ditangguhJadual} onChange={e => kemasSlot(mIdx, slot.id, "ditangguhJadual", e.target.checked)} style={{ width: 14, height: 14, accentColor: "#b91c1c" }} />
                                Ditangguhkan
                              </label>
                              {slot.ditangguhJadual && (
                                <div style={{ marginTop: 6 }}>
                                  <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Nota (jika perlu)</div>
                                  <input value={slot.ganti || ""} onChange={e => kemasSlot(mIdx, slot.id, "ganti", e.target.value)} placeholder="Sebab atau catatan penangguhan..." style={{ ...inp, borderColor: "#fca5a5" }} />
                                </div>
                              )}
                            </div>

                            <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 8 }}>
                              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: slot.kewanganSahaja ? "#854d0e" : C.txtMuted, cursor: "pointer", userSelect: "none", fontWeight: slot.kewanganSahaja ? "600" : "normal" }}>
                                <input type="checkbox" checked={!!slot.kewanganSahaja} onChange={e => kemasSlot(mIdx, slot.id, "kewanganSahaja", e.target.checked)} style={{ width: 14, height: 14, accentColor: "#854d0e" }} />
                                Laporan Kewangan Sahaja
                              </label>
                              {slot.kewanganSahaja && <div style={{ marginTop: 4, fontSize: 10, color: "#854d0e", paddingLeft: 8 }}>Slot ini tidak akan muncul dalam Jadual PDF</div>}
                            </div>

                            {!slot.programRasmi && !slot.ditangguhJadual && !slot.kewanganSahaja && (
                              <div style={{ borderTop: `1px dashed ${C.border}`, paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                                {semPenceramah.find(p => p.nama === slot.penceramah)?.gambar_url && (
                                  <button
                                    onClick={() => janaPosterId(slot, mIdx + 1)}
                                    style={{
                                      width: "100%", padding: "8px", borderRadius: 8,
                                      border: "1.5px solid #7c3aed",
                                      background: "#f5f3ff", color: "#6d28d9",
                                      cursor: "pointer", fontSize: 12, fontWeight: "700",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7
                                    }}
                                  >
                                    🎨 Jana Poster
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
          })}
          </>
        )}

        {/* ── TAB KEWANGAN ── */}
        {tab === "kewangan" && (
          <>
            {bendahariLink && (
              <div style={{ background: C.greenLt, border: "1.5px solid #86efac", borderRadius: 10, padding: "9px 12px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: C.green, fontWeight: "700", marginBottom: 2 }}>Link Laporan Bendahari</div>
                  <div style={{ fontSize: 10, color: C.green, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bendahariLink}</div>
                </div>
                <button
                  onClick={() => setPratontonBendahari(true)}
                  style={{ padding: "6px 10px", borderRadius: 7, border: `1.5px solid ${C.navy}`, background: "white", color: C.navy, cursor: "pointer", fontSize: 11, fontWeight: "700", flexShrink: 0, whiteSpace: "nowrap" }}
                >
                  Pratonton
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(bendahariLink); setSalinLink(true); setTimeout(() => setSalinLink(false), 2500) }}
                  style={{ padding: "6px 12px", borderRadius: 7, border: `1.5px solid ${C.wa}`, background: salinLink ? C.wa : "white", color: salinLink ? "white" : C.green, cursor: "pointer", fontSize: 11, fontWeight: "700", flexShrink: 0, whiteSpace: "nowrap" }}
                >
                  {salinLink ? "✓ Disalin!" : "Salin Link"}
                </button>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 12 }}>
              {[["Baki Lalu", `RM ${bakiLaluTotal}`, C.purple], ["Diagihkan", `RM ${totalAgihan}`, C.navy], ["Tersedia", `RM ${bakiLaluTotal + totalAgihan}`, C.green], ["Dibayar", `RM ${totalDibayar}`, C.green], ["Anjakan", `RM ${totalGanjak}`, C.warning], ["Baki Akhir", `RM ${baki}`, baki >= 0 ? C.green : C.danger]].map(([l, v, c]) => (
                <div key={l} style={{ background: C.card, border: `1.5px solid ${c}20`, borderRadius: 9, padding: "7px 9px" }}>
                  <div style={{ fontSize: 9, color: C.txtMuted, fontWeight: "600", marginBottom: 1 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: "700", color: c }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#f3e8ff", border: "1.5px solid #a855f7", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ fontWeight: "700", color: "#7c3aed", fontSize: 12, marginBottom: 10 }}>Baki Anjakan Bulan Lalu</div>
              {/* Baris Subuh */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <input type="checkbox" id="bakiSubuhChk" checked={(data.bakiLalu.subuhSet || 0) > 0} onChange={e => kemas(d => { d.bakiLalu.subuhSet = e.target.checked ? (d.bakiLalu.subuhSet > 0 ? d.bakiLalu.subuhSet : 1) : 0 })} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#7c3aed", flexShrink: 0 }} />
                <label htmlFor="bakiSubuhChk" style={{ fontSize: 11, color: "#6d28d9", fontWeight: "600", minWidth: 80, cursor: "pointer" }}>Subuh</label>
                <input type="number" min={0} value={data.bakiLalu.subuhSet || 0} onChange={e => kemas(d => { d.bakiLalu.subuhSet = Math.max(0, Number(e.target.value) || 0) })} onFocus={e => e.target.select()} style={{ ...inp, width: 52, textAlign: "center" }} />
                <span style={{ fontSize: 10, color: "#7c3aed" }}>slot</span>
                <span style={{ fontSize: 10, color: "#94a3b8", flex: 1 }}>× RM150</span>
                <span style={{ fontSize: 12, fontWeight: "800", color: "#6d28d9" }}>RM {(data.bakiLalu.subuhSet || 0) * 150}</span>
              </div>
              {/* Baris Selain Subuh */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <input type="checkbox" id="bakiSelainChk" checked={(data.bakiLalu.selainSubuhSet || 0) > 0} onChange={e => kemas(d => { d.bakiLalu.selainSubuhSet = e.target.checked ? (d.bakiLalu.selainSubuhSet > 0 ? d.bakiLalu.selainSubuhSet : 1) : 0 })} style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#7c3aed", flexShrink: 0 }} />
                <label htmlFor="bakiSelainChk" style={{ fontSize: 11, color: "#6d28d9", fontWeight: "600", minWidth: 80, cursor: "pointer" }}>Selain Subuh</label>
                <input type="number" min={0} value={data.bakiLalu.selainSubuhSet || 0} onChange={e => kemas(d => { d.bakiLalu.selainSubuhSet = Math.max(0, Number(e.target.value) || 0) })} onFocus={e => e.target.select()} style={{ ...inp, width: 52, textAlign: "center" }} />
                <span style={{ fontSize: 10, color: "#7c3aed" }}>slot</span>
                <span style={{ fontSize: 10, color: "#94a3b8", flex: 1 }}>× RM100</span>
                <span style={{ fontSize: 12, fontWeight: "800", color: "#6d28d9" }}>RM {(data.bakiLalu.selainSubuhSet || 0) * 100}</span>
              </div>
              {/* Jumlah auto */}
              <div style={{ borderTop: "1px solid #a855f740", paddingTop: 8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#7c3aed", fontWeight: "600" }}>Jumlah Baki:</span>
                <span style={{ fontSize: 15, fontWeight: "800", color: "#6d28d9" }}>RM {bakiLaluTotal}</span>
              </div>
              <input value={data.bakiLalu.catatan} onChange={e => kemas(d => { d.bakiLalu.catatan = e.target.value })} placeholder="Catatan baki lalu..." style={{ ...inp, fontSize: 11 }} />
            </div>

            <div style={{ background: C.card, border: `1.5px solid ${C.navy}30`, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontWeight: "700", color: C.navy, fontSize: 12 }}>Agihan Bendahari</div>
                <div style={{ fontSize: 13, fontWeight: "800", color: C.navy }}>RM {totalAgihan}</div>
              </div>
              {(data.agihan || []).map((a, aIdx) => {
                const sp = slotPermulaan[aIdx]
                const spLabel = sp ? `${formatTarikh(sp.tarikh)||sp.tarikh} ${sp.hari} ${sp.waktu}` : (aIdx === 0 ? "Slot pertama bulan ini" : "—")
                return (
                  <div key={a.id} style={{ marginBottom: 7 }}>
                    <div style={{ fontSize: 10, color: C.navy, marginBottom: 3, fontStyle: "italic" }}>Bermula: {spLabel}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="number" value={a.jumlah} onChange={e => kemas(d => { d.agihan[aIdx].jumlah = Number(e.target.value) || 0 })} onFocus={e => e.target.select()} placeholder="RM" style={{ ...inp, flex: 1, fontSize: 12 }} />
                      <button onClick={() => kemas(d => { d.agihan.splice(aIdx, 1) })} style={{ padding: "6px 8px", borderRadius: 7, border: "none", background: "none", cursor: "pointer", color: C.danger, flexShrink: 0 }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                )
              })}
              <button onClick={() => kemas(d => { d.agihan.push(agihKosong()) })} style={{ width: "100%", padding: "7px", borderRadius: 8, border: `1px dashed ${C.navy}50`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.navy, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Plus size={13} /> Tambah Agihan</button>
            </div>

            {data.minggu.map((minggu, mIdx) => {
              const buka = !!mingguBuka[mIdx]
              const dibayarMinggu = minggu.slots.filter(s => !s.muslimat && !s.ditangguhJadual).reduce((a, s) => s.sebenar ? a + (s.kadar || 0) + (s.sarapan || 0) : a, 0)
              return (
                <div key={minggu.id || mIdx} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
                  <div style={{ background: C.navy, display: "flex", alignItems: "center", padding: "8px 12px", gap: 8 }}>
                    <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setMingguBuka(p => ({ ...p, [mIdx]: !buka }))}>
                      <div style={{ color: "white", fontWeight: "700", fontSize: 13 }}>Minggu {mIdx + 1}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>Dibayar: RM {dibayarMinggu}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {buka ? <ChevronDown size={16} color="white" style={{ cursor: "pointer" }} onClick={() => setMingguBuka(p => ({ ...p, [mIdx]: false }))} />
                            : <ChevronRight size={16} color="white" style={{ cursor: "pointer" }} onClick={() => setMingguBuka(p => ({ ...p, [mIdx]: true }))} />}
                    </div>
                  </div>
                  {buka && (
                    <div style={{ padding: "10px 10px 6px" }}>
                      {minggu.slots.filter(s => !s.muslimat && !s.ditangguhJadual).map((slot, sIdx) => {
                        const isExp = expandSlot === slot.id
                        const dibayar = slot.sebenar ? (slot.kadar || 0) + (slot.sarapan || 0) : 0
                        return (
                          <div key={slot.id} style={{ border: isExp ? `1.5px solid ${C.navy}` : `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8, overflow: "hidden", background: slot.dariGanjak ? C.warningLt : C.bg }}>
                            <div style={{ display: "flex", alignItems: "center", padding: "8px 10px", gap: 8, background: isExp ? C.primaryLt : "transparent", borderBottom: isExp ? `1px solid ${C.border}` : "none" }}>
                              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minWidth: 0 }} onClick={() => { setExpandSlot(isExp ? null : slot.id); setMenuSlot(null) }}>
                                <div style={{ minWidth: 38 }}>
                                  <div style={{ fontSize: 11, fontWeight: "700", color: C.navy }}>{formatTarikh(slot.tarikh) || "—"}</div>
                                  <div style={{ fontSize: 9, color: C.txtMuted }}>{slot.hari}</div>
                                </div>
                                {slot.kewanganSahaja && <span style={{ fontSize: 9, fontWeight: "700", padding: "1px 5px", borderRadius: 4, background: "#fef9c3", color: "#854d0e", whiteSpace: "nowrap", flexShrink: 0 }}>Kew.</span>}
                                <span style={{ fontSize: 10, fontWeight: "600", padding: "1px 5px", borderRadius: 4, background: waktuWarna[slot.waktu] || C.bg, color: waktuText[slot.waktu] || C.txtMuted, whiteSpace: "nowrap" }}>{slot.waktu}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 11, fontWeight: "600", color: C.txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slot.penceramah || <span style={{ color: C.txtMuted }}>Penceramah...</span>}</div>
                                </div>
                                {slot.status && <span style={{ fontSize: 10, fontWeight: "600", color: statusWarna[slot.status] || C.txtMuted, whiteSpace: "nowrap" }}>{slot.status}</span>}
                                {(slot.anjakanKe || slot.anjakanDari) && <span style={{ fontSize: 9, fontWeight: "700", padding: "1px 5px", borderRadius: 4, background: "#fef3c7", color: "#92400e", whiteSpace: "nowrap", flexShrink: 0 }}>Anjakan</span>}
                                <div style={{ fontSize: 11, fontWeight: "700", color: dibayar > 0 ? C.green : C.txtMuted, minWidth: 36, textAlign: "right" }}>{dibayar > 0 ? `RM${dibayar}` : slot.kadar > 0 ? "—" : ""}</div>
                                {isExp ? <ChevronDown size={14} color={C.navy} /> : <ChevronRight size={14} color={C.txtMuted} />}
                              </div>
                              <button onClick={e => { e.stopPropagation(); if (menuSlot === slot.id) { setMenuSlot(null); setPadamKonfirmSlot(null) } else { setMenuSlot(slot.id); setPadamKonfirmSlot(null) } }} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: C.txtMuted, display: "flex", alignItems: "center", flexShrink: 0 }}>
                                <MoreVertical size={15} />
                              </button>
                            </div>

                            {menuSlot === slot.id && (
                              padamKonfirmSlot === slot.id ? (
                                <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 12px", background: C.dangerLt, display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ flex: 1, fontSize: 12, color: C.danger }}>Padam slot ini?</span>
                                  <button onClick={() => { kemas(d => { const real = d.minggu[mIdx].slots.findIndex(x => x.id === slot.id); if (real >= 0) d.minggu[mIdx].slots.splice(real, 1) }); setMenuSlot(null); setPadamKonfirmSlot(null); setExpandSlot(null) }} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: C.danger, color: "white", cursor: "pointer", fontSize: 12, fontWeight: "700" }}>Padam</button>
                                  <button onClick={() => { setMenuSlot(null); setPadamKonfirmSlot(null) }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 12 }}>Batal</button>
                                </div>
                              ) : (
                                <div style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
                                  <button onClick={() => setPadamKonfirmSlot(slot.id)} style={{ width: "100%", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.danger, display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
                                    <Trash2 size={13} /> Padam slot ini
                                  </button>
                                </div>
                              )
                            )}

                            {isExp && (
                              <div style={{ padding: "10px", borderTop: `1px solid ${C.border}`, background: C.card, display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ background: C.bg, borderRadius: 7, padding: "7px 10px", fontSize: 11 }}>
                                  <span style={{ fontWeight: "600", color: C.txt }}>{formatTarikh(slot.tarikh) || "—"} {slot.hari} · {slot.waktu}</span>
                                  {slot.pengisian && <span style={{ color: C.txtMuted, marginLeft: 6 }}>{slot.pengisian.split(" – ")[0]}</span>}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: slot.waktu === "Subuh" ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Status</div>
                                    <select value={slot.status} onChange={e => {
                                      const val = e.target.value
                                      kemasSlot(mIdx, slot.id, "status", val)
                                      if (val === "Hadir" || val === "Ganti") kemasSlot(mIdx, slot.id, "sebenar", true)
                                      if (val !== "Hadir" && val !== "Ganti") kemasSlot(mIdx, slot.id, "sebenar", false)
                                      if (val === "Tangguh") kemasSlot(mIdx, slot.id, "ganti", "Tiada Pengganti")
                                      if (val !== "Tangguh" && slot.ganti === "Tiada Pengganti") kemasSlot(mIdx, slot.id, "ganti", "")
                                    }} style={sel}>
                                      {STATUS_OPTS.map(o => <option key={o} value={o}>{o || "— Belum isi —"}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Sagu Hati (RM)</div>
                                    <input type="number" value={slot.kadar} onChange={e => kemasSlot(mIdx, slot.id, "kadar", Number(e.target.value) || 0)} onFocus={e => e.target.select()} style={inp} />
                                  </div>
                                  {slot.waktu === "Subuh" && (
                                    <div>
                                      <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Sarapan (RM)</div>
                                      <input type="number" value={slot.sarapan} onChange={e => kemasSlot(mIdx, slot.id, "sarapan", Number(e.target.value) || 0)} onFocus={e => e.target.select()} style={inp} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  {slot.status === "Ganti" && (
                                    <>
                                      <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Nama Pengganti</div>
                                      <select value={slot.ganti} onChange={e => kemasSlot(mIdx, slot.id, "ganti", e.target.value)} style={sel}>
                                        <option value="">— Pilih pengganti —</option>
                                        {slot.ganti && !cariPenceramah(slot.ganti) && <option value={slot.ganti}>{slot.ganti}</option>}
                                        {penceramahList.map(p => <option key={p.id} value={p.nama}>{p.nama}</option>)}
                                      </select>
                                    </>
                                  )}
                                  {slot.status === "Tangguh" && (
                                    <>
                                      <div style={{ fontSize: 10, color: "#d97706", marginTop: 2, marginBottom: 6 }}>Saguhati akan dianjakkan ke slot seterusnya</div>
                                      <div style={{ fontSize: 10, color: "#d97706", marginBottom: 3 }}>Anjakan ke slot (auto-kira atau isi manual)</div>
                                      <input value={slot.anjakanKe || ""} onChange={e => kemasSlot(mIdx, slot.id, "anjakanKe", e.target.value)} placeholder="cth: 8 Jun Isnin Maghrib" style={{ ...inp, borderColor: slot.anjakanKe ? "#d97706" : undefined }} />
                                    </>
                                  )}
                                  {slot.status !== "Ganti" && slot.status !== "Tangguh" && (
                                    <>
                                      <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Nota</div>
                                      <input value={slot.ganti} onChange={e => kemasSlot(mIdx, slot.id, "ganti", e.target.value)} placeholder="Catatan tambahan..." style={inp} />
                                    </>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: 16 }}>
                                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                                    <input type="checkbox" checked={slot.sebenar} onChange={e => kemasSlot(mIdx, slot.id, "sebenar", e.target.checked)} style={{ accentColor: C.green, width: 15, height: 15 }} />
                                    <span style={{ color: slot.sebenar ? "#16a34a" : C.txt, fontWeight: slot.sebenar ? "700" : "400" }}>Sagu hati diberikan</span>
                                  </label>
                                </div>
                                {slot.sebenar && (
                                  <div style={{ marginTop: 8 }}>
                                    <div style={{ fontSize: 10, color: "#d97706", marginBottom: 3 }}>Anjakan dari slot tangguh (jika ada)</div>
                                    <input value={slot.anjakanDari || ""} onChange={e => kemasSlot(mIdx, slot.id, "anjakanDari", e.target.value)} placeholder="cth: 1 Jun Isnin Maghrib" style={{ ...inp, borderColor: slot.anjakanDari ? "#d97706" : undefined }} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", background: C.primaryLt, borderRadius: 7, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: C.navy }}>Dibayar minggu ini:</span>
                        <span style={{ fontSize: 11, fontWeight: "700", color: C.green }}>RM {dibayarMinggu}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

          </>
        )}
      </div>

      {/* Modal pratonton Laporan PDF */}
      {praLaporanState && (
        <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.navy, flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: "700", color: "white" }}>Pratonton Laporan PDF</span>
            <button onClick={() => { URL.revokeObjectURL(praLaporanState.url); setPraLaporanState(null) }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={20} color="white" />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: "#94a3b8", padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {(praLaporanState.pages || []).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Halaman ${i + 1}`}
                style={{ width: "100%", maxWidth: 1000, height: "auto", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", background: "#fff" }}
              />
            ))}
          </div>
          <div style={{ padding: "12px 16px", background: C.navy, display: "flex", gap: 10, flexShrink: 0 }}>
            <button onClick={() => { URL.revokeObjectURL(praLaporanState.url); setPraLaporanState(null) }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "600" }}>
              Tutup
            </button>
            <button onClick={() => { const a = document.createElement("a"); a.href = praLaporanState.url; a.download = praLaporanState.namaFail; a.click() }} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: C.green, color: "white", cursor: "pointer", fontSize: 14, fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={16} /> Muat Turun
            </button>
          </div>
        </div>
      )}

      {/* Modal pratonton PDF */}
      {praState && (
        <div style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.navy, flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: "700", color: "white" }}>Pratonton PDF</span>
            <button onClick={() => { URL.revokeObjectURL(praState.url); setPraState(null) }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={20} color="white" />
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto", background: "#94a3b8", padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            {(praState.pages || []).map((src, i) => (
              <img key={i} src={src} alt={`Halaman ${i + 1}`}
                style={{ width: "100%", maxWidth: 1587, height: "auto", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", background: "#fff" }} />
            ))}
          </div>
          <div style={{ padding: "12px 16px", background: C.navy, display: "flex", gap: 10, flexShrink: 0 }}>
            <button onClick={() => { URL.revokeObjectURL(praState.url); setPraState(null) }} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", background: "none", color: "white", cursor: "pointer", fontSize: 14, fontWeight: "600" }}>
              Tutup
            </button>
            <button onClick={() => { const a = document.createElement("a"); a.href = praState.url; a.download = praState.namaFail; a.click() }} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: C.green, color: "white", cursor: "pointer", fontSize: 14, fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Download size={16} /> Muat Turun
            </button>
          </div>
        </div>
      )}

      {/* Speed-dial FAB — tab jadual */}
      {data && bulanAktif && tab === "jadual" && (
        <>
          <div style={{ position: "fixed", bottom: 24, right: 16, zIndex: 9000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            {showFabMenu && (
              <button
                onClick={() => { setShowFabMenu(false); janaJadualCetak() }}
                disabled={cetakLoading}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 24, border: "none", background: cetakLoading ? C.txtMuted : C.navy, color: "white", cursor: cetakLoading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: "700", boxShadow: "0 4px 14px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}
              >
                <FileText size={15} />
                {cetakLoading ? "Menjana..." : "Jadual A2"}
              </button>
            )}
            {showFabMenu && (
              <button
                onClick={() => { setShowFabMenu(false); janaJadualWA() }}
                disabled={waLoading}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 24, border: "none", background: waLoading ? C.txtMuted : "#0d9488", color: "white", cursor: waLoading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: "700", boxShadow: "0 4px 14px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}
              >
                <FileText size={15} />
                {waLoading ? "Menjana..." : "Jadual WA"}
              </button>
            )}
            {showFabMenu && (
              <button
                onClick={() => { setShowFabMenu(false); setShowSenaraiKad(true) }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 24, border: "none", background: "#0891b2", color: "white", cursor: "pointer", fontSize: 13, fontWeight: "700", boxShadow: "0 4px 14px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}
              >
                🗓️ Jana Kad
              </button>
            )}
            <button
              onClick={() => setShowFabMenu(v => !v)}
              style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: showFabMenu ? "#64748b" : C.navy, color: "white", cursor: "pointer", fontSize: 22, boxShadow: "0 4px 18px rgba(0,0,0,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {showFabMenu ? "✕" : "+"}
            </button>
          </div>
        </>
      )}

      {/* FAB Laporan PDF — tab laporan sahaja */}
      {data && bulanAktif && tab !== "jadual" && (
        <button
          onClick={janaLaporanPDF}
          disabled={laporanLoading}
          style={{ position: "fixed", bottom: 24, right: 16, display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 28, border: "none", background: laporanLoading ? C.txtMuted : C.navy, color: "white", cursor: laporanLoading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: "700", boxShadow: "0 4px 18px rgba(0,0,0,0.28)", whiteSpace: "nowrap", zIndex: 9000 }}
        >
          <FileText size={16} />
          {laporanLoading ? "Menjana..." : "Laporan PDF"}
        </button>
      )}

      {/* Senarai kad penceramah modal */}
      {showSenaraiKad && data && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowSenaraiKad(false)}>
          <div style={{ background: C.card, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 480, maxHeight: "75vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 14px", flexShrink: 0 }}>
              <div style={{ fontWeight: "800", fontSize: 15, color: C.txt }}>Jana Kad Penceramah</div>
              <button onClick={() => setShowSenaraiKad(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.txtMuted} /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 40px" }}>
              {(() => {
                const unikPenceramah = Object.entries(
                  (data.minggu || []).flatMap(mg => mg.slots || [])
                    .filter(s => s.penceramah && !s.ditangguhJadual && !s.kewanganSahaja)
                    .reduce((acc, s) => { acc[s.penceramah] = (acc[s.penceramah] || 0) + 1; return acc }, {})
                ).sort(([a], [b]) => a.localeCompare(b))
                if (!unikPenceramah.length) return <div style={{ color: C.txtMuted, fontSize: 13, textAlign: "center", padding: "24px 0" }}>Tiada penceramah dalam bulan ini.</div>
                return unikPenceramah.map(([nama, bilSlot]) => (
                  <button key={nama} onClick={async () => { setShowSenaraiKad(false); await janaKadPenceramah(nama) }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: C.bg, cursor: "pointer", marginBottom: 8, textAlign: "left" }}>
                    <div style={{ fontWeight: "700", fontSize: 14, color: C.txt }}>{nama}</div>
                    <div style={{ fontSize: 12, color: C.txtMuted, whiteSpace: "nowrap", marginLeft: 8 }}>{bilSlot} slot</div>
                  </button>
                ))
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Tetapan Masa Waktu modal */}
      {modalTetapanMasa && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: C.card, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 480, maxHeight: "75vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 14px", flexShrink: 0 }}>
              <div style={{ fontWeight: "800", fontSize: 15, color: C.txt }}>Tetapan Masa Waktu</div>
              <button onClick={() => setModalTetapanMasa(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.txtMuted} /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 40px" }}>
              <div style={{ fontSize: 12, color: C.txtMuted, marginBottom: 14 }}>
                Teks masa ini dipapar pada poster, kad penceramah dan mesej WhatsApp bagi setiap waktu. Ubah mengikut keperluan masjid.
              </div>
              {WAKTU_OPTS.map(w => (
                <div key={w} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>{w}</div>
                  <input value={masaWaktu[w] ?? ""} onChange={e => kemasMasaWaktu(w, e.target.value)} placeholder={WAKTU_MASA_DEFAULT[w]} style={inp} />
                </div>
              ))}
              <button onClick={() => { setMasaWaktu({ ...WAKTU_MASA_DEFAULT }); try { localStorage.removeItem("alc_biro_masa_waktu") } catch {} }} style={{ width: "100%", padding: "9px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.txtMuted, cursor: "pointer", fontSize: 12, fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <RotateCcw size={13} /> Set semula ke lalai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Penceramah modal */}
      {modalPenceramah && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: C.card, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 480, maxHeight: "75vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 16px 14px", flexShrink: 0 }}>
              <div style={{ fontWeight: "800", fontSize: 15, color: C.txt }}>Senarai Penceramah</div>
              <button onClick={() => setModalPenceramah(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.txtMuted} /></button>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 40px" }}>
            {semPenceramah.length === 0 && (
              <button onClick={muatPenceramahSediaAda} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: C.navy, color: "white", cursor: "pointer", fontWeight: "700", fontSize: 13, marginBottom: 10 }}>
                Muat Senarai Penceramah Sedia Ada ({PENCERAMAH_SEDIA_ADA.length} orang)
              </button>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: semPenceramah.length > 0 ? 6 : 14 }}>
              <input value={penceramahBaru} onChange={e => setPenceramahBaru(e.target.value)} placeholder="Nama penceramah baru..." onKeyDown={e => e.key === "Enter" && tambahPenceramah()} style={{ ...inp, flex: 1 }} />
              <button onClick={tambahPenceramah} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.navy, color: "white", cursor: "pointer", fontWeight: "700", fontSize: 13, whiteSpace: "nowrap" }}>+ Tambah</button>
            </div>
            {semPenceramah.length === 0 && (
              <button onClick={muatPenceramahSediaAda} style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: C.navy, color: "white", cursor: "pointer", fontWeight: "700", fontSize: 13, marginBottom: 10 }}>
                Muat Senarai Penceramah Lalai ({PENCERAMAH_SEDIA_ADA.length} orang)
              </button>
            )}
            {semPenceramah.map(p => {
              const isEdit = editPenceramah?.id === p.id
              return (
                <div key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 4px", gap: 8, cursor: "pointer" }} onClick={() => setEditPenceramah(isEdit ? null : { id: p.id, nama: p.nama, gambar_url: p.gambar_url || "", no_tel: p.no_tel || "", pengisian_list: p.pengisian_list?.length ? [...p.pengisian_list] : [{ pengisian: "", kitab: "" }] })}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                      {p.gambar_url && <img src={p.gambar_url} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}`, flexShrink: 0 }} />}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: "600", color: p.aktif ? C.txt : C.txtMuted, textDecoration: p.aktif ? "none" : "line-through" }}>{p.nama}</div>
                        {!isEdit && p.pengisian_list?.filter(x => x.pengisian || kitabTeks(x)).map((x, i) => <div key={i} style={{ fontSize: 10, color: C.txtMuted, marginTop: i === 0 ? 2 : 1 }}>{[x.pengisian, kitabTeks(x)].filter(Boolean).join(" – ")}</div>)}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); togolPenceramah(p.id, p.aktif) }} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${p.aktif ? C.border : C.primary}`, background: p.aktif ? C.card : `${C.primary}15`, cursor: "pointer", fontSize: 11, color: p.aktif ? C.txtMuted : C.primary, fontWeight: "600", flexShrink: 0 }}>
                      {p.aktif ? "Nyahaktif" : "Aktifkan"}
                    </button>
                    {isEdit ? <ChevronDown size={14} color={C.txtMuted} style={{ flexShrink: 0 }} /> : <ChevronRight size={14} color={C.txtMuted} style={{ flexShrink: 0 }} />}
                  </div>
                  {isEdit && (
                    <div style={{ padding: "8px 4px 12px", background: C.bg, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 3 }}>Nama</div>
                        <input value={editPenceramah.nama} onChange={e => setEditPenceramah(p => ({ ...p, nama: e.target.value }))} style={inp} />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 4 }}>Gambar Penceramah</div>
                        {editPenceramah.gambar_url ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img src={editPenceramah.gambar_url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                            <button onClick={() => setEditPenceramah(p => ({ ...p, gambar_url: "" }))} style={{ fontSize: 11, color: C.danger, background: "none", border: "none", cursor: "pointer" }}>Buang gambar</button>
                          </div>
                        ) : (
                          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, border: `1.5px dashed ${C.border}`, borderRadius: 8, padding: "7px 12px", cursor: gambarUploadLoading ? "not-allowed" : "pointer", fontSize: 12, color: C.primary }}>
                            <Upload size={13} />{gambarUploadLoading === editPenceramah.id ? "Memuat naik..." : "Muat naik gambar"}
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleGambarUpload(e, editPenceramah.id)} disabled={!!gambarUploadLoading} />
                          </label>
                        )}
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 4 }}>No. Telefon</div>
                        <input value={editPenceramah.no_tel || ""} onChange={e => setEditPenceramah(p => ({ ...p, no_tel: e.target.value }))} placeholder="cth: 0123456789" style={inp} />
                      </div>
                      <div style={{ fontSize: 10, color: C.txtMuted, marginBottom: 5 }}>Pengisian &amp; Kitab</div>
                      <datalist id="biro-pengisian-jenis-modal">{senaraiPengisian.map(x => <option key={x.id} value={x.nilai} />)}</datalist>
                      <datalist id="biro-kitab-list-modal">{senaraiKitab.map(x => <option key={x.id} value={x.nilai} />)}</datalist>
                      {editPenceramah.pengisian_list.map((item, idx) => (
                        <div key={idx} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px", marginBottom: 6 }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 9, color: C.txtMuted, marginBottom: 2 }}>Pengisian</div>
                              <input value={item.pengisian} onChange={e => editPgList(idx, "pengisian", e.target.value)} placeholder="cth: Tasauf" list="biro-pengisian-jenis-modal" style={{ ...inp, fontSize: 12 }} />
                            </div>
                            <button onClick={() => removePgList(idx)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: C.danger, flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}><X size={14} /></button>
                          </div>
                          <div style={{ fontSize: 9, color: C.txtMuted, marginBottom: 2 }}>Kitab / Nota</div>
                          {(Array.isArray(item.kitab) ? item.kitab : [item.kitab || ""]).map((k, kIdx, arr) => (
                            <div key={kIdx} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                              <input value={k} onChange={e => editPgKitab(idx, kIdx, e.target.value)} placeholder="cth: Kitab Mukashafah Al-Qulub" list="biro-kitab-list-modal" style={{ ...inp, fontSize: 12, flex: 1 }} />
                              {arr.length > 1 && <button onClick={() => removePgKitab(idx, kIdx)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: C.danger, flexShrink: 0 }}><X size={14} /></button>}
                            </div>
                          ))}
                          <button onClick={() => addPgKitab(idx)} style={{ padding: "3px 8px", borderRadius: 6, border: `1px dashed ${C.border}`, background: "none", cursor: "pointer", fontSize: 11, color: C.primary }}>+ Tambah Kitab</button>
                        </div>
                      ))}
                      <button onClick={addPgList} style={{ width: "100%", padding: "7px", borderRadius: 8, border: `1.5px dashed ${C.border}`, background: "none", cursor: "pointer", fontSize: 12, color: C.primary, marginBottom: 10 }}>+ Tambah Pengisian</button>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { if (window.confirm(`Padam "${editPenceramah.nama}"?`)) padamPenceramah(editPenceramah.id) }} style={{ padding: "7px 10px", borderRadius: 8, border: "none", background: "none", cursor: "pointer", color: C.danger, display: "flex", alignItems: "center" }}><Trash2 size={14} /></button>
                        <button onClick={() => setEditPenceramah(null)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 12 }}>Batal</button>
                        <button onClick={() => kemasKiniPenceramah(editPenceramah.id, { nama: editPenceramah.nama, pengisian_list: editPenceramah.pengisian_list, gambar_url: editPenceramah.gambar_url || null, no_tel: editPenceramah.no_tel || null })} style={{ flex: 2, padding: "7px", borderRadius: 8, border: "none", background: C.navy, color: "white", cursor: "pointer", fontSize: 12, fontWeight: "700" }}>Simpan</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          </div>
        </div>
      )}
    </div>
  )


  return null
}
