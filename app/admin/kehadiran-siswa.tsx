"use client"

import { ModalKoreksiAbsensi } from "./kehadiran-modal"
import { KartuRekapPeriode, PanelAbsensiKelas, PanelRiwayatAbsensi } from "./kehadiran-tabel"
import { useKehadiranSiswa } from "./kehadiran-hook"

/**
 * Menu "Absensi Siswa" di halaman admin: rekap + riwayat + koreksi (khusus admin).
 * Pencatatan kehadiran tetap dilakukan guru di /dashboard.
 */
export default function KehadiranSiswa({
  showNotification,
}: {
  showNotification: (title: string, message: string, isSuccess?: boolean) => void
}) {
  const {
    kelasAbsensi,
    setKelasAbsensi,
    modePeriode,
    setModePeriode,
    tanggalAktif,
    geserPeriode,
    pilihTanggal,
    muridPerKelas,
    rentangAktif,
    rekapPeriode,
    ringkasanMurid,
    jumlahBelumTercatat,
    filterRiwayatKelas,
    setFilterRiwayatKelas,
    filterRiwayatStatus,
    setFilterRiwayatStatus,
    riwayatSearch,
    setRiwayatSearch,
    setHalamanRiwayat,
    riwayatAbsensiMurid,
    riwayatAbsensiTampil,
    riwayatDitampilkan,
    halamanAktifRiwayat,
    totalHalamanRiwayat,
    absensiTerpilih,
    setAbsensiTerpilih,
    bukaModalKoreksi,
    statusKoreksi,
    setStatusKoreksi,
    isMenyimpanKoreksi,
    handleKoreksiAbsensi,
  } = useKehadiranSiswa(showNotification)

  return (
    <>
      <div className="space-y-6">
        {/* Rekap kehadiran pada jangkauan yang dipilih */}
        <KartuRekapPeriode rekap={rekapPeriode} labelRentang={rentangAktif.label} />

        {/* Kehadiran per kelas (hanya baca) */}
        <PanelAbsensiKelas
          kelasAbsensi={kelasAbsensi}
          onKelasAbsensi={setKelasAbsensi}
          modePeriode={modePeriode}
          onModePeriode={setModePeriode}
          tanggalAktif={tanggalAktif}
          onTanggalAktif={pilihTanggal}
          onGeserPeriode={geserPeriode}
          rentangLabel={rentangAktif.label}
          ringkasanMurid={ringkasanMurid}
          muridPerKelas={muridPerKelas}
          jumlahBelumTercatat={jumlahBelumTercatat}
          onUbah={bukaModalKoreksi}
        />

        {/* Riwayat absensi murid */}
        <PanelRiwayatAbsensi
          rentangLabel={rentangAktif.label}
          totalCatatan={riwayatAbsensiMurid.length}
          totalTampil={riwayatAbsensiTampil.length}
          search={riwayatSearch}
          onSearch={(nilai) => {
            setRiwayatSearch(nilai)
            setHalamanRiwayat(1)
          }}
          filterKelas={filterRiwayatKelas}
          onFilterKelas={(nilai) => {
            setFilterRiwayatKelas(nilai)
            setHalamanRiwayat(1)
          }}
          filterStatus={filterRiwayatStatus}
          onFilterStatus={(nilai) => {
            setFilterRiwayatStatus(nilai)
            setHalamanRiwayat(1)
          }}
          riwayatDitampilkan={riwayatDitampilkan}
          halamanAktif={halamanAktifRiwayat}
          totalHalaman={totalHalamanRiwayat}
          onMuatLebih={() => setHalamanRiwayat((halaman) => halaman + 1)}
          onUbah={bukaModalKoreksi}
        />
      </div>

      {/* Modal: koreksi absensi (khusus admin) */}
      {absensiTerpilih && (
        <ModalKoreksiAbsensi
          absensiTerpilih={absensiTerpilih}
          statusKoreksi={statusKoreksi}
          onStatusKoreksi={setStatusKoreksi}
          isMenyimpanKoreksi={isMenyimpanKoreksi}
          onSubmit={handleKoreksiAbsensi}
          onBatal={() => setAbsensiTerpilih(null)}
        />
      )}
    </>
  )
}
