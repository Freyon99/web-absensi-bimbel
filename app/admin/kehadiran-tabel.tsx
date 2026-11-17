"use client"

import { keISOHari } from "@/lib/tanggal"
import { KELAS_OPTIONS, formatKelas } from "@/lib/kelas"
import {
  BATAS_RIWAYAT,
  STATUS_ABSENSI,
  STATUS_BADGE_STYLE,
  STATUS_LABEL,
} from "./kehadiran-konstanta"
import { MODE_PERIODE_OPTIONS, type ModePeriode } from "./kehadiran-periode"
import type { LogAbsensiMurid, MuridRingkas, RekapStatus, RingkasanMurid } from "./kehadiran-tipe"

export function KartuRekapPeriode({
  rekap,
  labelRentang,
}: {
  rekap: RekapStatus[]
  labelRentang: string
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {rekap.map((status) => (
        <div
          key={status.value}
          className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-gray-500">{status.label}</p>
          <p className="mt-2 text-3xl font-bold text-[#0F3D8C]">{status.jumlah}</p>
          <p className="mt-1 text-xs text-gray-400">{labelRentang}</p>
        </div>
      ))}
    </div>
  )
}

export function PanelAbsensiKelas({
  kelasAbsensi,
  onKelasAbsensi,
  modePeriode,
  onModePeriode,
  tanggalAktif,
  onTanggalAktif,
  onGeserPeriode,
  rentangLabel,
  ringkasanMurid,
  muridPerKelas,
  jumlahBelumTercatat,
  onUbah,
}: {
  kelasAbsensi: string
  onKelasAbsensi: (kelas: string) => void
  modePeriode: ModePeriode
  onModePeriode: (mode: ModePeriode) => void
  tanggalAktif: string
  onTanggalAktif: (nilai: string) => void
  onGeserPeriode: (selisih: number) => void
  rentangLabel: string
  ringkasanMurid: RingkasanMurid[]
  muridPerKelas: MuridRingkas[]
  jumlahBelumTercatat: number
  onUbah: (item: LogAbsensiMurid) => void
}) {
  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#0F3D8C]">Absensi Siswa</h3>
          <p className="text-sm text-gray-500">
            Pantau kehadiran murid per hari, pekan, atau bulan. Pencatatan dilakukan oleh guru.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {rentangLabel}
            {" · "}
            {muridPerKelas.length} murid
            {jumlahBelumTercatat > 0 ? ` · ${jumlahBelumTercatat} belum tercatat` : ""}
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="flex rounded-xl border border-gray-200 p-1">
            {MODE_PERIODE_OPTIONS.map((opsi) => (
              <button
                key={opsi.value}
                type="button"
                onClick={() => onModePeriode(opsi.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  modePeriode === opsi.value
                    ? "bg-[#D6B25E] text-[#0F3D8C]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opsi.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onGeserPeriode(-1)}
              aria-label="Jangkauan sebelumnya"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ←
            </button>
            <input
              type="date"
              value={tanggalAktif}
              onChange={(e) => onTanggalAktif(e.target.value)}
              className="rounded-xl border border-[#D6B25E] bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C]"
            />
            <button
              type="button"
              onClick={() => onGeserPeriode(1)}
              aria-label="Jangkauan berikutnya"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => {
                onModePeriode("HARIAN")
                onTanggalAktif(keISOHari(new Date()))
              }}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Hari Ini
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {KELAS_OPTIONS.map((kelas) => (
              <button
                key={kelas}
                type="button"
                onClick={() => onKelasAbsensi(kelas)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  kelasAbsensi === kelas
                    ? "bg-[#D6B25E] text-[#0F3D8C] shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {formatKelas(kelas)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-[#D6B25E] bg-white shadow-inner">
        <table className="w-full min-w-max text-sm table-auto">
          <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Nama Siswa</th>
              <th className="px-4 py-3 text-left">Panggilan</th>
              {modePeriode === "HARIAN" ? (
                <>
                  <th className="px-4 py-3 text-left">Status Kehadiran</th>
                  <th className="px-4 py-3 text-left">Dicatat Oleh</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left">Hadir</th>
                  <th className="px-4 py-3 text-left">Izin</th>
                  <th className="px-4 py-3 text-left">Sakit</th>
                  <th className="px-4 py-3 text-left">Alpha</th>
                  <th className="px-4 py-3 text-left">% Hadir</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {muridPerKelas.length === 0 ? (
              <tr>
                <td
                  colSpan={modePeriode === "HARIAN" ? 5 : 8}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Belum ada murid terdaftar di kelas{" "}
                  {kelasAbsensi ? formatKelas(kelasAbsensi) : "-"}
                </td>
              </tr>
            ) : (
              ringkasanMurid.map((item, index) => (
                <tr key={item.murid.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {item.murid.namaLengkap}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.murid.namaPanggilan}</td>

                  {modePeriode === "HARIAN" ? (
                    <>
                      <td className="px-4 py-3">
                        {item.catatan.length > 0 ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              STATUS_BADGE_STYLE[item.catatan[0].status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {STATUS_LABEL[item.catatan[0].status] || item.catatan[0].status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Belum tercatat</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>{item.catatan[0]?.guru?.nama || "-"}</span>
                          {item.catatan[0] && (
                            <button
                              type="button"
                              onClick={() => onUbah(item.catatan[0])}
                              className="text-xs font-semibold text-[#0F3D8C] hover:underline"
                            >
                              Ubah
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-gray-600">{item.hitung.HADIR}</td>
                      <td className="px-4 py-3 text-gray-600">{item.hitung.IZIN}</td>
                      <td className="px-4 py-3 text-gray-600">{item.hitung.SAKIT}</td>
                      <td className="px-4 py-3 text-gray-600">{item.hitung.ALPHA}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.persenHadir === null ? "-" : `${item.persenHadir}%`}
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Guru yang mencatat kehadiran murid; admin dapat mengoreksi catatan yang salah.
      </p>
    </div>
  )
}

export function PanelRiwayatAbsensi({
  rentangLabel,
  totalCatatan,
  totalTampil,
  search,
  onSearch,
  filterKelas,
  onFilterKelas,
  filterStatus,
  onFilterStatus,
  riwayatDitampilkan,
  halamanAktif,
  totalHalaman,
  onMuatLebih,
  onUbah,
}: {
  rentangLabel: string
  totalCatatan: number
  totalTampil: number
  search: string
  onSearch: (nilai: string) => void
  filterKelas: string
  onFilterKelas: (nilai: string) => void
  filterStatus: string
  onFilterStatus: (nilai: string) => void
  riwayatDitampilkan: LogAbsensiMurid[]
  halamanAktif: number
  totalHalaman: number
  onMuatLebih: () => void
  onUbah: (item: LogAbsensiMurid) => void
}) {
  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#0F3D8C]">Riwayat Absensi Siswa</h3>
          <p className="text-sm text-gray-500">
            {rentangLabel} · Menampilkan {totalTampil} dari {totalCatatan} catatan absensi.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C] sm:w-56"
          />

          <select
            value={filterKelas}
            onChange={(e) => onFilterKelas(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C] sm:w-44"
          >
            <option value="">Semua Kelas</option>
            {KELAS_OPTIONS.map((kelas) => (
              <option key={kelas} value={kelas}>
                {formatKelas(kelas)}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => onFilterStatus(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C] sm:w-40"
          >
            <option value="">Semua Status</option>
            {STATUS_ABSENSI.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-128 w-full overflow-auto rounded-xl border border-[#D6B25E] bg-white shadow-inner">
        <table className="w-full min-w-max text-sm table-auto">
          <thead className="sticky top-0 bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Nama Siswa</th>
              <th className="px-4 py-3 text-left">Kelas</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Dicatat Oleh</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {totalTampil === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Belum ada catatan absensi yang cocok
                </td>
              </tr>
            ) : (
              riwayatDitampilkan.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}
                    {new Date(item.tanggal).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {item.murid.namaLengkap}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatKelas(item.murid.kelas)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        STATUS_BADGE_STYLE[item.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.guru?.nama || "Pengguna Terhapus"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onUbah(item)}
                      className="text-xs font-semibold text-[#0F3D8C] hover:underline"
                    >
                      Ubah Status
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalCatatan >= BATAS_RIWAYAT && (
        <p className="mt-2 text-xs font-semibold text-amber-600">
          Baru menampilkan {BATAS_RIWAYAT} catatan terbaru. Persempit rentang tanggal atau tambah
          filter untuk hasil yang lebih sedikit.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>
          Menampilkan {riwayatDitampilkan.length} dari {totalTampil} catatan
        </span>
        {halamanAktif < totalHalaman && (
          <button
            type="button"
            onClick={onMuatLebih}
            className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Muat lebih banyak
          </button>
        )}
      </div>
    </div>
  )
}
