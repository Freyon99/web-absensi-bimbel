"use client"

import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/session"
import { fetchApi } from "@/lib/api-client"
import { BATCH_SISWA, FORM_GURU_AWAL, FORM_SISWA_AWAL, RINGKASAN_SISWA_AWAL } from "../constants"
import { absensiByGuru, siswaByKelas, siswaByPembayaran, totalAbsensiSelesai } from "../utils"
import type {
  FormGuru,
  FormSiswa,
  LogAbsenGuru,
  ModalAdmin,
  Murid,
  MenuAdmin,
  RingkasanSiswa,
  TampilkanKonfirmasi,
  TampilkanNotifikasi,
  UserProfile,
} from "../types"

interface UseAdminDataParams {
  showNotification: TampilkanNotifikasi
  showConfirm: TampilkanKonfirmasi
  setIsLoadingGlobal: (loading: boolean) => void
}

export function useAdminData({
  showNotification,
  showConfirm,
  setIsLoadingGlobal,
}: UseAdminDataParams) {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [menuAktif, setMenuAktif] = useState<MenuAdmin>("Dashboard")
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dashboardSearch, setDashboardSearch] = useState("")
  const [activeSiswaKelasFilter, setActiveSiswaKelasFilter] = useState("")
  const [activeSiswaPembayaranFilter, setActiveSiswaPembayaranFilter] = useState("")
  const [activeAbsensiGuruFilter, setActiveAbsensiGuruFilter] = useState("")

  // Data siswa dipaginasi di server; ringkasan dipakai untuk statistik/grafik.
  const [ringkasanGlobal, setRingkasanGlobal] = useState<RingkasanSiswa>(RINGKASAN_SISWA_AWAL)
  const [halamanSiswa, setHalamanSiswa] = useState<Murid[]>([])
  const [totalSiswaTerfilter, setTotalSiswaTerfilter] = useState(0)
  const [halamanSiswaAktif, setHalamanSiswaAktif] = useState(1)
  const [cocokSiswa, setCocokSiswa] = useState(0) // pemicu ambil ulang setelah ubah data
  const [dashboardSiswaResults, setDashboardSiswaResults] = useState<Murid[]>([])
  const [guruList, setGuruList] = useState<UserProfile[]>([])
  const [absenGuruList, setAbsenGuruList] = useState<LogAbsenGuru[]>([])
  const [totalAbsenGuru, setTotalAbsenGuru] = useState(0)

  const [modalType, setModalType] = useState<ModalAdmin>(null)
  const [selectedSiswa, setSelectedSiswa] = useState<Murid | null>(null)
  const [selectedGuru, setSelectedGuru] = useState<UserProfile | null>(null) // Tambahkan state guru terpilih

  const [formGuru, setFormGuru] = useState<FormGuru>(FORM_GURU_AWAL) // SINKRON: Tambah noHp
  const [formSiswa, setFormSiswa] = useState<FormSiswa>(FORM_SISWA_AWAL)

  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      setIsLoadingGlobal(true)
      const savedUser = localStorage.getItem("user")

      if (!savedUser) {
        router.push("/")
        setIsLoadingGlobal(false)
        return
      }

      const parsedUser = JSON.parse(savedUser)
      if (parsedUser.peran !== "ADMIN") {
        router.push("/dashboard")
        setIsLoadingGlobal(false)
        return
      }

      setUser(parsedUser)
      await Promise.all([fetchRingkasanGlobal(), fetchDataGuru(), fetchAbsensiGuru()])
      setIsLoadingGlobal(false)
    }

    checkSession()
  }, [router, setIsLoadingGlobal])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function fetchRingkasanGlobal() {
    try {
      const res = await fetchApi("/api/murid/ringkasan")
      if (res.ok) setRingkasanGlobal(await res.json())
    } catch (error) {
      console.error("Gagal memuat ringkasan siswa:", error)
    }
  }

  async function cariDashboard(kata: string) {
    try {
      const res = await fetchApi(`/api/murid?cari=${encodeURIComponent(kata)}&batas=50`)
      if (res.ok) setDashboardSiswaResults(await res.json())
    } catch (error) {
      console.error("Gagal mencari siswa:", error)
    }
  }

  // Data Siswa diambil per halaman dari server sesuai filter yang aktif.
  useEffect(() => {
    const muat = async () => {
      const params = new URLSearchParams()
      if (activeSiswaKelasFilter) params.set("kelas", activeSiswaKelasFilter)
      if (activeSiswaPembayaranFilter) params.set("pembayaran", activeSiswaPembayaranFilter)
      if (searchQuery.trim()) params.set("cari", searchQuery.trim())

      const paramsRingkasan = new URLSearchParams(params)
      params.set("mulai", String((halamanSiswaAktif - 1) * BATCH_SISWA))
      params.set("batas", String(BATCH_SISWA))

      try {
        const [resRingkasan, resHalaman] = await Promise.all([
          fetchApi(`/api/murid/ringkasan?${paramsRingkasan}`),
          fetchApi(`/api/murid?${params}`),
        ])
        if (resRingkasan.ok) {
          const ringkasan = await resRingkasan.json()
          setTotalSiswaTerfilter(ringkasan.total)
        }
        if (resHalaman.ok) setHalamanSiswa(await resHalaman.json())
      } catch (error) {
        console.error("Gagal memuat data siswa:", error)
      }
    }
    void muat()
  }, [
    activeSiswaKelasFilter,
    activeSiswaPembayaranFilter,
    searchQuery,
    halamanSiswaAktif,
    cocokSiswa,
  ])

  async function fetchDataGuru() {
    try {
      const res = await fetchApi("/api/users")
      if (res.ok) {
        const data = await res.json()
        setGuruList(data.filter((u: UserProfile) => u.peran === "GURU"))
      }
    } catch (error) {
      console.error("Gagal memuat data guru:", error)
    }
  }

  async function fetchAbsensiGuru() {
    try {
      const res = await fetchApi("/api/absensi-guru?batas=1000")
      if (res.ok) {
        const data = await res.json()
        setAbsenGuruList(data.data)
        setTotalAbsenGuru(data.total)
      }
    } catch (error) {
      console.error("Gagal memuat log absen guru:", error)
    }
  }

  const handleTambahGuru = async (e: FormEvent) => {
    e.preventDefault()
    const res = await fetchApi("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formGuru, peran: "GURU" }),
    })
    if (res.ok) {
      showNotification("Sukses", "Akun Guru baru berhasil didaftarkan!", true)
      setModalType(null)
      setFormGuru(FORM_GURU_AWAL)
      fetchDataGuru()
    } else {
      const d = await res.json()
      showNotification("Gagal", d.message || "Gagal menambah guru", false)
    }
  }

  // 1. Fungsi untuk membuka modal edit dan mengisi form dengan data guru yang dipilih
  const openEditGuruModal = (guru: UserProfile) => {
    setSelectedGuru(guru)
    setFormGuru({
      nama: guru.nama,
      email: guru.email,
      password: "", // Sengaja dikosongkan, diisi hanya jika ingin ganti password
      noHp: guru.noHp || "",
    })
    setModalType("editGuru") // Memicu modal edit guru muncul
  }

  // 2. Fungsi untuk mengirim data perubahan guru ke API backend (PUT)
  const handleEditGuru = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedGuru) return

    setIsLoadingGlobal(true)

    try {
      const res = await fetchApi(`/api/users/${selectedGuru.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formGuru), // Mengirim nama, email, noHp, dan password jika diisi
      })

      const data = await res.json()

      if (res.ok) {
        showNotification("Sukses", "Data informasi pengajar berhasil diperbarui!", true)
        setModalType(null)
        fetchDataGuru() // Refresh tabel guru
      } else {
        showNotification("Gagal", data.message || "Gagal memperbarui data guru", false)
      }
    } catch {
      showNotification("Error", "Terjadi kesalahan jaringan", false)
    } finally {
      setIsLoadingGlobal(false)
    }
  }

  const handleDetailGuru = (guru: UserProfile) => {
    showNotification(
      "Profil Pengajar",
      `Nama: ${guru.nama}\nNo HP: ${guru.noHp || "-"}\nEmail: ${guru.email}`,
      true,
    )
  }

  const handleHapusGuru = (id: string, nama: string) => {
    showConfirm("Hapus Akun Pengajar?", `Hapus permanen akun milik ${nama}?`, async () => {
      const res = await fetchApi(`/api/users/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        showNotification("Terhapus", "Akun pengajar berhasil dihapus.", true)
        fetchDataGuru()
      }
    })
  }

  const handleTambahSiswa = async (e: FormEvent) => {
    e.preventDefault()
    const res = await fetchApi("/api/murid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formSiswa),
    })
    if (res.ok) {
      showNotification("Sukses", "Data siswa baru berhasil ditambahkan!", true)
      setModalType(null)
      fetchRingkasanGlobal()
      setCocokSiswa((k) => k + 1)
    } else {
      showNotification("Gagal", "Gagal menambahkan siswa.", false)
    }
  }

  const handleEditSiswa = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedSiswa) return
    const res = await fetchApi(`/api/murid/${selectedSiswa.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formSiswa),
    })
    if (res.ok) {
      showNotification("Sukses", "Data siswa berhasil diperbarui!", true)
      setModalType(null)
      fetchRingkasanGlobal()
      setCocokSiswa((k) => k + 1)
    } else {
      showNotification("Gagal", "Gagal memperbarui data siswa.", false)
    }
  }

  const handleHapusSiswa = async (id: string, nama: string) => {
    showConfirm(
      "Hapus Data Murid?",
      `Apakah Anda yakin ingin menghapus data murid ${nama}? Riwayat absensinya juga akan ikut terhapus.`,
      async () => {
        const res = await fetchApi(`/api/murid/${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          showNotification("Terhapus", "Data murid telah dihapus dari sistem.", true)
          fetchRingkasanGlobal()
          setCocokSiswa((k) => k + 1)
        } else {
          showNotification("Gagal", "Gagal menghapus data murid.", false)
        }
      },
    )
  }

  const openEditModal = (siswa: Murid) => {
    setSelectedSiswa(siswa)
    setFormSiswa({
      namaLengkap: siswa.namaLengkap,
      namaPanggilan: siswa.namaPanggilan,
      kelas: siswa.kelas,
      sekolahAsal: siswa.sekolahAsal,
      namaOrangTuaWali: siswa.namaOrangTuaWali,
      pekerjaanAyah: siswa.pekerjaanAyah,
      pekerjaanIbu: siswa.pekerjaanIbu,
      alamatDomisili: siswa.alamatDomisili,
      noHpOrangTua: siswa.noHpOrangTua,
      hari: siswa.hari,
      jam: siswa.jam,
      pembayaran: siswa.pembayaran,
      mapel: siswa.mapel,
      catatanAnak: siswa.catatanAnak || "",
    })
    setModalType("editSiswa")
  }

  const openDetailModal = (siswa: Murid) => {
    setSelectedSiswa(siswa)
    setModalType("detailSiswa")
  }

  const triggerLogoutValidation = () => {
    setShowProfileMenu(false)
    showConfirm(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari sistem Admin Aksara Bimbel?",
      executeLogout,
    )
  }

  const executeLogout = () => {
    void logout()
  }

  const resetDataFilters = () => {
    setActiveSiswaKelasFilter("")
    setActiveSiswaPembayaranFilter("")
    setActiveAbsensiGuruFilter("")
  }

  const handleUbahDashboardSearch = (nilai: string) => {
    setDashboardSearch(nilai)
    const kata = nilai.trim()
    if (!kata) {
      setDashboardSiswaResults([])
      return
    }
    void cariDashboard(kata)
  }

  const pilihMenu = (menu: MenuAdmin) => {
    resetDataFilters()
    setMenuAktif(menu)
  }

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  const handleProfileSettings = () => {
    setShowProfileMenu(false)
    showNotification("Informasi Sistem", "Fitur pengaturan profil admin segera hadir!", true)
  }

  const openTambahGuruModal = () => {
    setFormGuru(FORM_GURU_AWAL)
    setModalType("tambahGuru")
  }

  const openTambahSiswaModal = () => {
    setFormSiswa(FORM_SISWA_AWAL)
    setModalType("tambahSiswa")
  }

  const halamanSebelumnya = () => {
    setHalamanSiswaAktif((halaman) => Math.max(1, halaman - 1))
  }

  const halamanBerikutnya = () => {
    setHalamanSiswaAktif((halaman) => halaman + 1)
  }

  const openSiswaByKelas = (kelas: string) => {
    setSearchQuery("")
    setHalamanSiswaAktif(1)
    setActiveSiswaKelasFilter(kelas)
    setActiveSiswaPembayaranFilter("")
    setActiveAbsensiGuruFilter("")
    setMenuAktif("Data Siswa")
  }

  const openSiswaByPembayaran = (pembayaran: string) => {
    setSearchQuery("")
    setHalamanSiswaAktif(1)
    setActiveSiswaKelasFilter("")
    setActiveSiswaPembayaranFilter(pembayaran)
    setActiveAbsensiGuruFilter("")
    setMenuAktif("Data Siswa")
  }

  const openAbsensiByGuru = (namaGuru: string) => {
    setActiveSiswaKelasFilter("")
    setActiveSiswaPembayaranFilter("")
    setActiveAbsensiGuruFilter(namaGuru)
    setMenuAktif("Absensi Guru")
  }

  const muatUlangSiswa = () => {
    setCocokSiswa((k) => k + 1)
  }

  // ===== Data turunan (read-only) =====
  const dataSiswaKelas = siswaByKelas(ringkasanGlobal)
  const dataSiswaPembayaran = siswaByPembayaran(ringkasanGlobal)
  const dataAbsensiGuru = absensiByGuru(absenGuruList)
  const selesaiAbsensiGuru = totalAbsensiSelesai(absenGuruList)
  const maksSiswaKelas = Math.max(...dataSiswaKelas.map((item) => item.value), 1)
  const maksAbsensiGuru = Math.max(...dataAbsensiGuru.map((item) => item.value), 1)
  const hasilGuruDashboard = guruList.filter((g) =>
    [g.nama, g.email, g.noHp].some((value) =>
      value?.toLowerCase().includes(dashboardSearch.toLowerCase()),
    ),
  )
  const absensiGuruTampil = activeAbsensiGuruFilter
    ? absenGuruList.filter(
        (item) => (item.guru?.nama || "Guru Terhapus") === activeAbsensiGuruFilter,
      )
    : absenGuruList

  return {
    user,
    menuAktif,
    showProfileMenu,
    dropdownRef,
    searchQuery,
    setSearchQuery,
    dashboardSearch,
    activeSiswaKelasFilter,
    activeSiswaPembayaranFilter,
    activeAbsensiGuruFilter,
    ringkasanGlobal,
    halamanSiswa,
    totalSiswaTerfilter,
    halamanSiswaAktif,
    setHalamanSiswaAktif,
    dashboardSiswaResults,
    guruList,
    absenGuruList,
    totalAbsenGuru,
    modalType,
    setModalType,
    selectedSiswa,
    selectedGuru,
    formGuru,
    setFormGuru,
    formSiswa,
    setFormSiswa,
    fetchRingkasanGlobal,
    fetchDataGuru,
    fetchAbsensiGuru,
    cariDashboard,
    handleUbahDashboardSearch,
    pilihMenu,
    toggleProfileMenu,
    handleProfileSettings,
    triggerLogoutValidation,
    resetDataFilters,
    halamanSebelumnya,
    halamanBerikutnya,
    openSiswaByKelas,
    openSiswaByPembayaran,
    openAbsensiByGuru,
    openTambahGuruModal,
    openTambahSiswaModal,
    openEditGuruModal,
    openEditModal,
    openDetailModal,
    handleTambahGuru,
    handleEditGuru,
    handleHapusGuru,
    handleDetailGuru,
    handleTambahSiswa,
    handleEditSiswa,
    handleHapusSiswa,
    muatUlangSiswa,
    dataSiswaKelas,
    dataSiswaPembayaran,
    dataAbsensiGuru,
    selesaiAbsensiGuru,
    maksSiswaKelas,
    maksAbsensiGuru,
    hasilGuruDashboard,
    absensiGuruTampil,
  }
}
