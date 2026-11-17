"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useNotification } from "@/context/NotificationContext"
import { logout } from "@/lib/session"
import { fetchApi } from "@/lib/api-client"
import { KELAS_OPTIONS } from "@/lib/kelas"

interface UserProfile {
  nama: string
  email: string
  peran: string
}

interface Murid {
  id: string
  namaLengkap: string
  kelas: string
}

interface LogAbsenGuru {
  id: string
  waktuMasuk: string
  waktuPulang: string | null
}

const STATUS_OPTIONS = [
  { value: "HADIR", label: "Hadir", select: "border-emerald-300 text-emerald-700" },
  { value: "IZIN", label: "Izin", select: "border-sky-300 text-sky-700" },
  { value: "SAKIT", label: "Sakit", select: "border-amber-300 text-amber-700" },
  { value: "ALPHA", label: "Alpha", select: "border-rose-300 text-rose-700" },
]

const STATUS_SELECT_STYLE = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.select]),
) as Record<string, string>

function getInitials(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function formatJam(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatTanggalHariIni() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const profileRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  const { showNotification, showConfirm, setIsLoadingGlobal } = useNotification()

  // State Navigasi & Menu
  const [menuAktif, setMenuAktif] = useState("Absensi Guru")
  const [kelasAktif, setKelasAktif] = useState("CALISTUNG")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [sidebarMobileBuka, setSidebarMobileBuka] = useState(false)

  // State Data Dinamis dari Database
  const [user, setUser] = useState<UserProfile | null>(null)
  const [allMurid, setAllMurid] = useState<Murid[]>([])
  const [riwayatAbsenGuru, setRiwayatAbsenGuru] = useState<LogAbsenGuru[]>([])
  const [totalAbsenGuru, setTotalAbsenGuru] = useState(0)
  const [absenSiswa, setAbsenSiswa] = useState<Record<string, string>>({})
  // Murid yang sudah diabsen hari ini (oleh guru manapun) tidak ditampilkan lagi.
  const [terabsenHariIni, setTerabsenHariIni] = useState<Set<string>>(new Set())
  // Ringkasan di server: total murid + sisa yang belum diabsen per kelas.
  const [terabsenPerKelas, setTerabsenPerKelas] = useState<Record<string, number>>({})
  const [ringkasanMurid, setRingkasanMurid] = useState<{
    total: number
    perKelas: Record<string, number>
  }>({ total: 0, perKelas: {} })
  const [isLoading, setIsLoading] = useState(false)

  // Tutup dropdown profil & drawer mobile saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false)
      }
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        setSidebarMobileBuka(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Ambil sesi login pengguna
  useEffect(() => {
    const checkGuruSession = async () => {
      setIsLoadingGlobal(true)

      const savedUser = localStorage.getItem("user")

      if (!savedUser) {
        router.push("/")
        setIsLoadingGlobal(false)
        return
      }

      const parsedUser = JSON.parse(savedUser)

      if (parsedUser.peran === "ADMIN") {
        router.push("/admin")
        setIsLoadingGlobal(false)
        return
      }

      setUser(parsedUser)
      await Promise.all([fetchRingkasanMurid(), fetchRiwayatAbsenGuru(), fetchAbsensiHariIni()])

      setIsLoadingGlobal(false)
    }

    checkGuruSession()
  }, [router, setIsLoadingGlobal])

  async function fetchRingkasanMurid() {
    try {
      const res = await fetchApi("/api/murid/ringkasan")
      if (res.ok) {
        setRingkasanMurid(await res.json())
      }
    } catch (error) {
      console.error("Gagal memuat ringkasan murid:", error)
    }
  }

  // Data murid diambil ulang setiap kali kelas yang dibuka berubah.
  useEffect(() => {
    const muat = async () => {
      try {
        const res = await fetchApi(`/api/murid?kelas=${encodeURIComponent(kelasAktif)}`)
        if (res.ok) {
          const data: Murid[] = await res.json()
          setAllMurid(data)
        }
      } catch (error) {
        console.error("Gagal memuat data murid:", error)
      }
    }
    void muat()
  }, [kelasAktif])

  async function fetchRiwayatAbsenGuru() {
    try {
      const res = await fetchApi("/api/absensi-guru?batas=500")
      if (res.ok) {
        const data = await res.json()
        setRiwayatAbsenGuru(data.data)
        setTotalAbsenGuru(data.total)
      }
    } catch (error) {
      console.error("Gagal memuat log absen guru:", error)
    }
  }

  // Murid yang sudah diabsen hari ini disembunyikan dari daftar absensi guru.
  async function fetchAbsensiHariIni() {
    try {
      const res = await fetchApi("/api/absensi?hariIni=1")
      if (res.ok) {
        const data: { muridId: string; murid?: { kelas?: string } }[] = await res.json()
        setTerabsenHariIni(new Set(data.map((item) => item.muridId)))

        const hitung: Record<string, number> = {}
        for (const item of data) {
          const kelas = item.murid?.kelas
          if (kelas) hitung[kelas] = (hitung[kelas] || 0) + 1
        }
        setTerabsenPerKelas(hitung)
      }
    } catch (error) {
      console.error("Gagal memuat absensi murid hari ini:", error)
    }
  }

  const handleAbsenGuruDatang = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const res = await fetchApi("/api/absensi-guru", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()

      if (res.ok) {
        showNotification("Berhasil", "Absen datang Anda hari ini sukses dicatat!", true)
        fetchRiwayatAbsenGuru()
      } else {
        showNotification("Gagal Absen", data.message || "Terjadi kesalahan", false)
      }
    } catch {
      showNotification("Error", "Terjadi kesalahan jaringan", false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAbsenGuruPulang = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const res = await fetchApi("/api/absensi-guru", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()
      if (res.ok) {
        showNotification("Berhasil", "Absen pulang Anda hari ini sukses dicatat!", true)
        fetchRiwayatAbsenGuru()
      } else {
        showNotification("Gagal Absen", data.message || "Terjadi kesalahan", false)
      }
    } catch {
      showNotification("Error", "Terjadi kesalahan jaringan", false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimpanAbsensiSiswa = async () => {
    if (!user || muridBelumAbsen.length === 0) return

    setIsLoading(true)
    let successCount = 0
    let gagal: { nama: string; pencatat: string | null }[] = []

    try {
      // Semua murid dikirim bersamaan: satu kelas selesai jauh lebih cepat.
      const hasil = await Promise.all(
        muridBelumAbsen.map(async (murid) => {
          const statusSiswa = absenSiswa[murid.id] || "ALPHA"

          try {
            const res = await fetchApi("/api/absensi", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                muridId: murid.id,
                status: statusSiswa,
              }),
            })

            if (res.ok) return { ok: true as const }

            const data = await res.json().catch(() => null)
            return {
              ok: false as const,
              nama: murid.namaLengkap,
              pencatat: data?.pencatat ?? null,
            }
          } catch {
            return { ok: false as const, nama: murid.namaLengkap, pencatat: null }
          }
        }),
      )

      successCount = hasil.filter((h) => h.ok).length
      gagal = hasil.filter((h) => !h.ok) as { nama: string; pencatat: string | null }[]

      if (successCount > 0) {
        showNotification(
          "Berhasil Disimpan",
          `Sukses mencatat ${successCount} data absensi siswa Kelas ${formatKelas(kelasAktif)}!`,
          true,
        )
      }

      if (gagal.length > 0) {
        const daftar = gagal
          .slice(0, 5)
          .map((item) => (item.pencatat ? `${item.nama} (oleh ${item.pencatat})` : item.nama))
          .join(", ")
        showNotification(
          "Sebagian Tidak Bisa Diabsen",
          `${gagal.length} murid sudah diabsen hari ini dan terkunci: ${daftar}${gagal.length > 5 ? ", ..." : ""}. Minta admin bila perlu koreksi.`,
          false,
        )
      }
    } catch {
      showNotification("Gagal Menyimpan", "Terjadi kegagalan sistem saat menyimpan absensi", false)
    } finally {
      setIsLoading(false)
      // Daftar disegarkan: murid yang baru dicatat hilang dari pilihan guru.
      fetchAbsensiHariIni()
    }
  }

  const triggerLogoutValidation = () => {
    setShowProfileMenu(false)
    showConfirm(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari sistem Aksara Bimbel?",
      executeLogout,
    )
  }

  const executeLogout = () => {
    void logout()
  }

  const formatKelas = (kelas: string) => kelas.replaceAll("_", " ")
  const normalizeKelas = (kelas: string) => formatKelas(kelas).toLowerCase()
  const muridPerKelas = allMurid.filter(
    (m) => normalizeKelas(m.kelas) === normalizeKelas(kelasAktif),
  )

  // Murid yang sudah diabsen hari ini tampil di daftar guru: satu hari satu absen.
  const muridBelumAbsen = muridPerKelas.filter((m) => !terabsenHariIni.has(m.id))
  const jumlahTerabsen = muridPerKelas.length - muridBelumAbsen.length

  const jumlahHadir = muridBelumAbsen.filter(
    (m) => (absenSiswa[m.id] || "ALPHA") === "HADIR",
  ).length

  const tandaiSemuaHadir = () => {
    setAbsenSiswa((prev) => {
      const next = { ...prev }
      for (const m of muridBelumAbsen) next[m.id] = "HADIR"
      return next
    })
  }

  const resetStatus = () => {
    setAbsenSiswa((prev) => {
      const next = { ...prev }
      for (const m of muridBelumAbsen) next[m.id] = "ALPHA"
      return next
    })
  }

  // Data turunan untuk ringkasan hari ini
  const absenHariIni = riwayatAbsenGuru.find((log) => {
    const d = new Date(log.waktuMasuk)
    const now = new Date()
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  })
  const sudahAbsenDatang = Boolean(absenHariIni)
  const sudahAbsenPulang = Boolean(absenHariIni?.waktuPulang)
  const jamDatang = absenHariIni ? formatJam(absenHariIni.waktuMasuk) : null
  const jamPulang = absenHariIni?.waktuPulang ? formatJam(absenHariIni.waktuPulang) : null

  // Sidebar (dipakai di desktop & drawer mobile)
  const menuSidebar = (
    <div className="flex h-full flex-col">
      <button
        onClick={() => {
          setMenuAktif("Absensi Guru")
          setSidebarMobileBuka(false)
        }}
        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
          menuAktif === "Absensi Guru"
            ? "bg-[#D6B25E] text-[#0F3D8C] shadow-lg"
            : "bg-[#174894] text-white hover:bg-[#2157ad]"
        }`}
      >
        <svg
          className={`h-5 w-5 ${menuAktif === "Absensi Guru" ? "text-[#0F3D8C]" : "text-blue-200"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <span className="font-semibold">Absensi Guru</span>
      </button>

      <p className="mt-6 px-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
        Daftar Kelas
      </p>

      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto">
        {KELAS_OPTIONS.map((kelas) => {
          const aktif = menuAktif === "Absensi Siswa" && kelasAktif === kelas
          const sisa = (ringkasanMurid.perKelas[kelas] ?? 0) - (terabsenPerKelas[kelas] ?? 0)

          return (
            <button
              key={kelas}
              onClick={() => {
                setKelasAktif(kelas)
                setMenuAktif("Absensi Siswa")
                setSidebarMobileBuka(false)
              }}
              className={`group flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left transition-all duration-200 ${
                aktif
                  ? "bg-[#D6B25E] text-[#0F3D8C] shadow-lg"
                  : "bg-[#174894] text-white hover:bg-[#2157ad]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${aktif ? "bg-[#0F3D8C]" : "bg-blue-200"}`}
                />
                <span className="font-medium">{formatKelas(kelas)}</span>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  aktif ? "bg-[#0F3D8C]/10 text-[#0F3D8C]" : "bg-white/10 text-blue-100"
                }`}
              >
                {sisa}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  if (!user) return null
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarMobileBuka(true)}
            aria-label="Buka menu"
            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg font-bold text-[#0F3D8C] sm:text-xl">Aksara Bimbel</h1>
            <p className="hidden text-xs text-gray-400 sm:block">Panel Pengajar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-lg border border-[#D6B25E] bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 sm:block">
            {user.nama}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="Menu profil"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F3D8C] text-white shadow-md transition hover:bg-[#0B2E69] active:scale-95"
            >
              <span className="font-semibold uppercase">{getInitials(user.nama)}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-2xl">
                <div className="border-b border-gray-100 px-3 py-2 text-left">
                  <p className="truncate text-sm font-bold text-gray-900">{user.nama}</p>
                  <p className="text-xs capitalize text-gray-400">{user.peran.toLowerCase()}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    showNotification(
                      "Informasi Sistem",
                      "Fitur pengaturan profil pengajar segera hadir!",
                      true,
                    )
                  }}
                  className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </button>
                <button
                  onClick={triggerLogoutValidation}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Drawer mobile */}
      {sidebarMobileBuka && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarMobileBuka(false)}
          />
          <aside
            ref={sidebarRef}
            className="absolute left-0 top-0 h-full w-72 bg-[#0F3D8C] p-5 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200/70">
                  Aksara Bimbel
                </p>
                <p className="text-lg font-bold">Menu Guru</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarMobileBuka(false)}
                aria-label="Tutup menu"
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {menuSidebar}
          </aside>
        </div>
      )}

      {/* Layout utama */}
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 bg-[#0F3D8C] p-5 text-white lg:block">
          {menuSidebar}
        </aside>

        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-8">
          {/* HERO */}
          <div className="overflow-hidden rounded-2xl bg-[#0F3D8C] p-6 text-white shadow-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#D6B25E]">
                  {formatTanggalHariIni()}
                </p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Selamat datang, {user.nama.split(" ")[0]}!
                </h2>
                <p className="mt-2 max-w-xl text-sm text-blue-100">
                  {sudahAbsenPulang
                    ? "Anda sudah menyelesaikan absensi hari ini. Terima kasih atas dedikasinya!"
                    : sudahAbsenDatang
                      ? `Absen datang tercatat pukul ${jamDatang}. Jangan lupa catat absen pulang sebelum berangkat.`
                      : "Catat kehadiran Anda hari ini dan pantau kehadiran siswa per kelas."}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={handleAbsenGuruDatang}
                    disabled={isLoading || sudahAbsenDatang}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D6B25E] px-5 py-2.5 font-semibold text-[#0F3D8C] shadow-md transition hover:bg-[#c7a34e] active:scale-95 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/70"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {sudahAbsenDatang ? "Sudah Absen Datang" : "Absen Datang"}
                  </button>

                  <button
                    onClick={handleAbsenGuruPulang}
                    disabled={isLoading || !sudahAbsenDatang || sudahAbsenPulang}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 font-semibold text-white transition hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                    {sudahAbsenPulang ? "Sudah Absen Pulang" : "Absen Pulang"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:w-90">
                <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
                  <p className="text-2xl font-bold text-[#D6B25E]">
                    {sudahAbsenDatang ? jamDatang : "--:--"}
                  </p>
                  <p className="mt-1 text-xs text-blue-100">Jam Datang</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
                  <p className="text-2xl font-bold text-[#D6B25E]">
                    {sudahAbsenPulang ? jamPulang : "--:--"}
                  </p>
                  <p className="mt-1 text-xs text-blue-100">Jam Pulang</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
                  <p className="text-2xl font-bold text-[#D6B25E]">{riwayatAbsenGuru.length}</p>
                  <p className="mt-1 text-xs text-blue-100">Total Absensi</p>
                </div>
              </div>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Total Siswa</p>
                <span className="rounded-lg bg-blue-50 p-2 text-[#0F3D8C]">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-[#0F3D8C]">{ringkasanMurid.total}</p>
              <p className="mt-1 text-xs text-gray-400">Siswa terdaftar</p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Kelas Aktif</p>
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 10L12 5 2 10l10 5 10-5z" />
                    <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
                  </svg>
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-emerald-700">{KELAS_OPTIONS.length}</p>
              <p className="mt-1 text-xs text-gray-400">Tingkat tersedia</p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Kehadiran Hari Ini</p>
                <span className="rounded-lg bg-amber-50 p-2 text-amber-700">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-amber-700">
                {sudahAbsenDatang ? "Hadir" : "Belum"}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {sudahAbsenPulang
                  ? "Sudah absen pulang"
                  : sudahAbsenDatang
                    ? "Belum absen pulang"
                    : "Belum absen datang"}
              </p>
            </div>

            <div className="rounded-xl border border-rose-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Riwayat Absensi</p>
                <span className="rounded-lg bg-rose-50 p-2 text-rose-700">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-rose-700">{totalAbsenGuru}</p>
              <p className="mt-1 text-xs text-gray-400">Log kehadiran</p>
            </div>
          </div>
          {/* TAMPILAN 1: ABSENSI GURU */}
          {menuAktif === "Absensi Guru" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-[#0F3D8C]">Riwayat Kehadiran</h3>
                <p className="text-sm text-gray-500">Log absensi datang dan pulang Anda.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-max text-sm">
                  <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                    <tr>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jam Datang</th>
                      <th className="px-4 py-3 text-left">Jam Pulang</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatAbsenGuru.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                          Belum ada riwayat kehadiran
                        </td>
                      </tr>
                    ) : (
                      riwayatAbsenGuru.map((log) => {
                        const dateObjMasuk = new Date(log.waktuMasuk)
                        const dateObjPulang = log.waktuPulang ? new Date(log.waktuPulang) : null

                        return (
                          <tr key={log.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-600">
                              {dateObjMasuk.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-700">
                              {dateObjMasuk.toLocaleTimeString("id-ID")}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-700">
                              {dateObjPulang
                                ? dateObjPulang.toLocaleTimeString("id-ID")
                                : "Belum Absen Pulang"}
                            </td>
                            <td className="px-4 py-3">
                              {dateObjPulang ? (
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                  Lengkap
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                  Belum Pulang
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAMPILAN 2: ABSENSI SISWA */}
          {menuAktif === "Absensi Siswa" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F3D8C]">
                    Absensi Kelas {formatKelas(kelasAktif)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pengajar: <span className="font-semibold text-blue-700">{user.nama}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-lg bg-blue-50 px-3 py-1 font-semibold text-[#0F3D8C]">
                    {muridBelumAbsen.length} siswa
                  </span>
                  <span className="rounded-lg bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                    {jumlahHadir} hadir
                  </span>
                  {jumlahTerabsen > 0 && (
                    <span
                      className="rounded-lg bg-gray-100 px-3 py-1 font-semibold text-gray-500"
                      title="Murid yang sudah diabsen hari ini tidak bisa diabsen ulang"
                    >
                      {jumlahTerabsen} sudah diabsen
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={tandaiSemuaHadir}
                    className="rounded-lg border border-gray-200 px-3 py-1 font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Semua Hadir
                  </button>

                  <button
                    type="button"
                    onClick={resetStatus}
                    className="rounded-lg border border-gray-200 px-3 py-1 font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-max text-sm">
                  <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                    <tr>
                      <th className="px-5 py-4 text-left">No</th>
                      <th className="px-5 py-4 text-left">Nama Siswa</th>
                      <th className="px-5 py-4 text-left">Status Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {muridPerKelas.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-gray-400">
                          Tidak ada data murid terdaftar untuk{" "}
                          <span className="font-bold text-red-500">
                            Kelas {formatKelas(kelasAktif)}
                          </span>{" "}
                          di database.
                        </td>
                      </tr>
                    ) : muridBelumAbsen.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-12 text-center text-gray-400">
                          Semua murid{" "}
                          <span className="font-bold text-[#0F3D8C]">
                            Kelas {formatKelas(kelasAktif)}
                          </span>{" "}
                          sudah diabsen hari ini dan tidak bisa diabsen ulang. Koreksi hanya bisa
                          dilakukan admin.
                        </td>
                      </tr>
                    ) : (
                      muridBelumAbsen.map((murid, index) => {
                        const status = absenSiswa[murid.id] || "ALPHA"

                        return (
                          <tr key={murid.id} className="border-t hover:bg-gray-50">
                            <td className="px-5 py-4 text-gray-600">{index + 1}</td>
                            <td className="px-5 py-4 font-semibold text-gray-700">
                              {murid.namaLengkap}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <select
                                  value={status}
                                  onChange={(e) =>
                                    setAbsenSiswa({
                                      ...absenSiswa,
                                      [murid.id]: e.target.value,
                                    })
                                  }
                                  className={`rounded-lg border bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-[#0F3D8C]/10 ${STATUS_SELECT_STYLE[status]}`}
                                >
                                  {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {muridBelumAbsen.length > 0 && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">
                    {jumlahHadir} dari {muridBelumAbsen.length} siswa tercatat hadir.
                    {jumlahTerabsen > 0 && ` ${jumlahTerabsen} lainnya sudah diabsen.`}
                  </p>

                  <button
                    onClick={handleSimpanAbsensiSiswa}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F3D8C] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#0B2E69] active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M17 21v-8H7v8M7 3v5h8" />
                    </svg>
                    {isLoading ? "Menyimpan Ke Database..." : "Simpan Absensi"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
