"use client"

import { useGuruDashboard } from "./hooks/use-guru-dashboard"
import GuruNavbar from "./components/guru-navbar"
import GuruSidebar from "./components/guru-sidebar"
import HeroAbsensi from "./components/hero-absensi"
import StatCards from "./components/stat-cards"
import RiwayatAbsensiGuru from "./components/riwayat-absensi-guru"
import AbsensiSiswa from "./components/absensi-siswa"

export default function DashboardPage() {
  const {
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
  } = useGuruDashboard()

  if (!user) return null

  const pilihAbsensiGuru = () => {
    setMenuAktif("Absensi Guru")
    setSidebarMobileBuka(false)
  }

  const pilihKelas = (kelas: string) => {
    setKelasAktif(kelas)
    setMenuAktif("Absensi Siswa")
    setSidebarMobileBuka(false)
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-gray-900">
      {/* Navbar */}
      <GuruNavbar
        user={user}
        showProfileMenu={showProfileMenu}
        profileRef={profileRef}
        setShowProfileMenu={setShowProfileMenu}
        setSidebarMobileBuka={setSidebarMobileBuka}
        triggerLogoutValidation={triggerLogoutValidation}
      />

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

            <GuruSidebar
              menuAktif={menuAktif}
              kelasAktif={kelasAktif}
              sisaPerKelas={sisaPerKelas}
              onPilihAbsensiGuru={pilihAbsensiGuru}
              onPilihKelas={pilihKelas}
            />
          </aside>
        </div>
      )}

      {/* Layout utama */}
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 bg-[#0F3D8C] p-5 text-white lg:block">
          <GuruSidebar
            menuAktif={menuAktif}
            kelasAktif={kelasAktif}
            sisaPerKelas={sisaPerKelas}
            onPilihAbsensiGuru={pilihAbsensiGuru}
            onPilihKelas={pilihKelas}
          />
        </aside>

        <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-8">
          {/* Hero absensi */}
          <HeroAbsensi
            nama={user.nama}
            isLoading={isLoading}
            sudahAbsenDatang={sudahAbsenDatang}
            sudahAbsenPulang={sudahAbsenPulang}
            jamDatang={jamDatang}
            jamPulang={jamPulang}
            totalAbsensi={riwayatAbsenGuru.length}
            onAbsenDatang={handleAbsenGuruDatang}
            onAbsenPulang={handleAbsenGuruPulang}
          />

          {/* Kartu statistik */}
          <StatCards
            totalSiswa={ringkasanMurid.total}
            sudahAbsenDatang={sudahAbsenDatang}
            sudahAbsenPulang={sudahAbsenPulang}
            totalAbsenGuru={totalAbsenGuru}
          />

          {/* Riwayat absensi guru */}
          {menuAktif === "Absensi Guru" && <RiwayatAbsensiGuru riwayat={riwayatAbsenGuru} />}

          {/* Absensi siswa */}
          {menuAktif === "Absensi Siswa" && (
            <AbsensiSiswa
              user={user}
              kelasAktif={kelasAktif}
              muridPerKelas={muridPerKelas}
              muridBelumAbsen={muridBelumAbsen}
              jumlahHadir={jumlahHadir}
              jumlahTerabsen={jumlahTerabsen}
              absenSiswa={absenSiswa}
              setAbsenSiswa={setAbsenSiswa}
              isLoading={isLoading}
              onSimpan={handleSimpanAbsensiSiswa}
              onTandaiSemuaHadir={tandaiSemuaHadir}
              onReset={resetStatus}
            />
          )}
        </main>
      </div>
    </div>
  )
}
