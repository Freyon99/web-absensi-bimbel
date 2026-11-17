"use client"

import { useNotification } from "@/context/NotificationContext"
import KehadiranSiswa from "./kehadiran-siswa"
import { useAdminData } from "./hooks/use-admin-data"
import { useImportExport } from "./hooks/use-import-export"
import AdminNavbar from "./components/admin-navbar"
import AdminSidebar from "./components/admin-sidebar"
import DashboardSection from "./components/dashboard-section"
import SiswaSection from "./components/siswa-section"
import GuruSection from "./components/guru-section"
import AbsensiGuruSection from "./components/absensi-guru-section"
import { ModalTambahGuru, ModalEditGuru } from "./components/guru-modals"
import { ModalFormSiswa, ModalDetailSiswa } from "./components/siswa-modals"
import HasilImportModal from "./components/hasil-import-modal"

export default function AdminPage() {
  const { showNotification, showConfirm, setIsLoadingGlobal } = useNotification()

  const admin = useAdminData({ showNotification, showConfirm, setIsLoadingGlobal })
  const importEkspor = useImportExport({
    showNotification,
    fetchRingkasanGlobal: admin.fetchRingkasanGlobal,
    muatUlangSiswa: admin.muatUlangSiswa,
  })

  if (!admin.user) return null

  return (
    <div className="min-h-screen max-w-full flex flex-col bg-[#FFFDF8] overflow-hidden text-gray-900">
      {/* Navbar Atas */}
      <AdminNavbar
        user={admin.user}
        showProfileMenu={admin.showProfileMenu}
        dropdownRef={admin.dropdownRef}
        onToggleProfileMenu={admin.toggleProfileMenu}
        onProfileSettings={admin.handleProfileSettings}
        onLogout={admin.triggerLogoutValidation}
      />

      {/* Konten Utama Layout Dinamik */}
      <div className="flex w-full max-w-full min-h-[calc(100vh-72px)] overflow-hidden">
        <AdminSidebar menuAktif={admin.menuAktif} onPilihMenu={admin.pilihMenu} />

        <main className="flex-1 min-w-0 p-4 sm:p-8 bg-[#FFFDF8] overflow-y-auto">
          {/* MENU AWAL: DASHBOARD STATISTIK */}
          {admin.menuAktif === "Dashboard" && (
            <DashboardSection
              dashboardSearch={admin.dashboardSearch}
              onUbahDashboardSearch={admin.handleUbahDashboardSearch}
              ringkasan={admin.ringkasanGlobal}
              totalGuru={admin.guruList.length}
              totalAbsenGuru={admin.totalAbsenGuru}
              totalAbsensiSelesai={admin.selesaiAbsensiGuru}
              siswaKelas={admin.dataSiswaKelas}
              maksSiswaKelas={admin.maksSiswaKelas}
              absensiGuru={admin.dataAbsensiGuru}
              maksAbsensiGuru={admin.maksAbsensiGuru}
              siswaPembayaran={admin.dataSiswaPembayaran}
              dashboardSiswaResults={admin.dashboardSiswaResults}
              dashboardGuruResults={admin.hasilGuruDashboard}
              onBukaSiswaByKelas={admin.openSiswaByKelas}
              onBukaSiswaByPembayaran={admin.openSiswaByPembayaran}
              onBukaAbsensiByGuru={admin.openAbsensiByGuru}
              onBukaDetailSiswa={admin.openDetailModal}
            />
          )}

          {/* MENU 1: DATA SISWA */}
          {admin.menuAktif === "Data Siswa" && (
            <SiswaSection
              searchQuery={admin.searchQuery}
              onUbahSearchQuery={admin.setSearchQuery}
              activeSiswaKelasFilter={admin.activeSiswaKelasFilter}
              activeSiswaPembayaranFilter={admin.activeSiswaPembayaranFilter}
              onResetFilters={admin.resetDataFilters}
              halamanSiswa={admin.halamanSiswa}
              totalSiswaTerfilter={admin.totalSiswaTerfilter}
              halamanSiswaAktif={admin.halamanSiswaAktif}
              onHalamanSebelumnya={admin.halamanSebelumnya}
              onHalamanBerikutnya={admin.halamanBerikutnya}
              isImporting={importEkspor.isImporting}
              isExporting={importEkspor.isExporting}
              onBerkasDipilih={importEkspor.handleBerkasDipilih}
              onEkspor={importEkspor.handleEkspor}
              onEksporTemplate={importEkspor.handleEksporTemplate}
              onTambahSiswa={admin.openTambahSiswaModal}
              onDetail={admin.openDetailModal}
              onEdit={admin.openEditModal}
              onHapus={admin.handleHapusSiswa}
            />
          )}

          {/* MENU 2: DATA GURU (SINKRON REFERENSI GAMBAR) */}
          {admin.menuAktif === "Data Guru" && (
            <GuruSection
              guruList={admin.guruList}
              onTambahGuru={admin.openTambahGuruModal}
              onDetailGuru={admin.handleDetailGuru}
              onEditGuru={admin.openEditGuruModal}
              onHapusGuru={admin.handleHapusGuru}
            />
          )}

          {/* MENU 3: ABSENSI GURU */}
          {admin.menuAktif === "Absensi Guru" && (
            <AbsensiGuruSection
              absensiGuruTampil={admin.absensiGuruTampil}
              activeAbsensiGuruFilter={admin.activeAbsensiGuruFilter}
              onResetFilters={admin.resetDataFilters}
            />
          )}

          {/* MENU 4: ABSENSI SISWA */}
          {admin.menuAktif === "Absensi Siswa" && (
            <KehadiranSiswa showNotification={showNotification} />
          )}
        </main>
      </div>

      {/* POP-UP MODAL 1: FORM TAMBAH GURU + INPUT NO HP */}
      {admin.modalType === "tambahGuru" && (
        <ModalTambahGuru
          formGuru={admin.formGuru}
          onUbahFormGuru={admin.setFormGuru}
          onSubmit={admin.handleTambahGuru}
          onClose={() => admin.setModalType(null)}
        />
      )}

      {/* POP-UP MODAL 2: FORM INPUT & EDIT DATA SISWA */}
      {(admin.modalType === "tambahSiswa" || admin.modalType === "editSiswa") && (
        <ModalFormSiswa
          modalType={admin.modalType}
          formSiswa={admin.formSiswa}
          onUbahFormSiswa={admin.setFormSiswa}
          onSubmitTambah={admin.handleTambahSiswa}
          onSubmitEdit={admin.handleEditSiswa}
          onClose={() => admin.setModalType(null)}
        />
      )}

      {/* POP-UP MODAL 3: LIHAT DETAIL KARTU SISWA */}
      {admin.modalType === "detailSiswa" && (
        <ModalDetailSiswa siswa={admin.selectedSiswa} onClose={() => admin.setModalType(null)} />
      )}

      {/* POP-UP MODAL 1B: FORM EDIT DATA GURU (BARU) */}
      {admin.modalType === "editGuru" && admin.selectedGuru && (
        <ModalEditGuru
          formGuru={admin.formGuru}
          onUbahFormGuru={admin.setFormGuru}
          onSubmit={admin.handleEditGuru}
          onClose={() => admin.setModalType(null)}
        />
      )}

      {/* POP-UP MODAL 4: HASIL IMPORT DATA MURID */}
      <HasilImportModal
        hasilImport={importEkspor.hasilImport}
        onTutup={importEkspor.tutupHasilImport}
      />
    </div>
  )
}
