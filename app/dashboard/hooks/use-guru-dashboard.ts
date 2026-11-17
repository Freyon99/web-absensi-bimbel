"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useNotification } from "@/context/NotificationContext"
import { logout } from "@/lib/session"
import { fetchApi } from "@/lib/api-client"
import { KELAS_OPTIONS } from "@/lib/kelas"
import type { LogAbsenGuru, Murid, RingkasanMurid, UserProfile } from "../types"
import { formatKelas } from "@/lib/kelas"
import { formatJam } from "../constants"

export function useGuruDashboard() {
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
  const [ringkasanMurid, setRingkasanMurid] = useState<RingkasanMurid>({
    total: 0,
    perKelas: {},
  })
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

  // Sisa murid yang belum diabsen per kelas untuk badge sidebar.
  const sisaPerKelas: Record<string, number> = {}
  for (const kelas of KELAS_OPTIONS) {
    sisaPerKelas[kelas] = (ringkasanMurid.perKelas[kelas] ?? 0) - (terabsenPerKelas[kelas] ?? 0)
  }

  return {
    user,
    isLoading,
    menuAktif,
    setMenuAktif,
    kelasAktif,
    setKelasAktif,
    showProfileMenu,
    setShowProfileMenu,
    sidebarMobileBuka,
    setSidebarMobileBuka,
    profileRef,
    sidebarRef,
    ringkasanMurid,
    sisaPerKelas,
    muridPerKelas,
    muridBelumAbsen,
    jumlahHadir,
    jumlahTerabsen,
    absenSiswa,
    setAbsenSiswa,
    absenHariIni,
    sudahAbsenDatang,
    sudahAbsenPulang,
    jamDatang,
    jamPulang,
    riwayatAbsenGuru,
    totalAbsenGuru,
    tandaiSemuaHadir,
    resetStatus,
    handleAbsenGuruDatang,
    handleAbsenGuruPulang,
    handleSimpanAbsensiSiswa,
    triggerLogoutValidation,
  }
}
