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
      {/* Navbar */}
      <AdminNavbar
        user={admin.user}
        showProfileMenu={admin.showProfileMenu}
        dropdownRef={admin.dropdownRef}
        onToggleProfileMenu={admin.toggleProfileMenu}
        onProfileSettings={admin.handleProfileSettings}
        onLogout={admin.triggerLogoutValidation}
      />

      {/* Konten utama */}
      <div className="flex w-full max-w-full min-h-[calc(100vh-72px)] overflow-hidden">
        <AdminSidebar menuAktif={admin.menuAktif} onPilihMenu={admin.pilihMenu} />

        <main className="flex-1 min-w-0 p-4 sm:p-8 bg-[#FFFDF8] overflow-y-auto">
          {/* Dashboard */}
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

          {/* Data Siswa */}
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

          {/* Data Guru */}
          {admin.menuAktif === "Data Guru" && (
            <GuruSection
              guruList={admin.guruList}
              onTambahGuru={admin.openTambahGuruModal}
              onDetailGuru={admin.handleDetailGuru}
              onEditGuru={admin.openEditGuruModal}
              onHapusGuru={admin.handleHapusGuru}
            />
          )}

          {/* Absensi Guru */}
          {admin.menuAktif === "Absensi Guru" && (
            <AbsensiGuruSection
              absensiGuruTampil={admin.absensiGuruTampil}
              activeAbsensiGuruFilter={admin.activeAbsensiGuruFilter}
              onResetFilters={admin.resetDataFilters}
            />
          )}

          {/* Absensi Siswa */}
          {admin.menuAktif === "Absensi Siswa" && (
            <KehadiranSiswa showNotification={showNotification} />
          )}
        </main>
      </div>

      {/* Modal: tambah guru */}
      {admin.modalType === "tambahGuru" && (
        <ModalTambahGuru
          formGuru={admin.formGuru}
          onUbahFormGuru={admin.setFormGuru}
          onSubmit={admin.handleTambahGuru}
          onClose={() => admin.setModalType(null)}
        />
      )}

      {/* Modal: tambah/edit siswa */}
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

      {/* Modal: detail siswa */}
      {admin.modalType === "detailSiswa" && (
        <ModalDetailSiswa siswa={admin.selectedSiswa} onClose={() => admin.setModalType(null)} />
      )}

      {/* Modal: edit guru */}
      {admin.modalType === "editGuru" && admin.selectedGuru && (
        <ModalEditGuru
          formGuru={admin.formGuru}
          onUbahFormGuru={admin.setFormGuru}
          onSubmit={admin.handleEditGuru}
          onClose={() => admin.setModalType(null)}
        />
      )}

      {/* Modal: hasil import */}
      <HasilImportModal
        hasilImport={importEkspor.hasilImport}
        onTutup={importEkspor.tutupHasilImport}
      />
    </div>
  )
}
