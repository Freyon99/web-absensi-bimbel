"use client"

import { useRef } from "react"
import type { ChangeEvent } from "react"
import { BATCH_SISWA } from "../constants"
import { formatKelas } from "@/lib/kelas"
import type { Murid } from "../types"

interface SiswaSectionProps {
  searchQuery: string
  onUbahSearchQuery: (nilai: string) => void
  activeSiswaKelasFilter: string
  activeSiswaPembayaranFilter: string
  onResetFilters: () => void
  halamanSiswa: Murid[]
  totalSiswaTerfilter: number
  halamanSiswaAktif: number
  onHalamanSebelumnya: () => void
  onHalamanBerikutnya: () => void
  isImporting: boolean
  isExporting: boolean
  onBerkasDipilih: (e: ChangeEvent<HTMLInputElement>) => void
  onEkspor: (format: "csv" | "xlsx") => void
  onEksporTemplate: () => void
  onTambahSiswa: () => void
  onDetail: (siswa: Murid) => void
  onEdit: (siswa: Murid) => void
  onHapus: (id: string, nama: string) => void
}

export default function SiswaSection({
  searchQuery,
  onUbahSearchQuery,
  activeSiswaKelasFilter,
  activeSiswaPembayaranFilter,
  onResetFilters,
  halamanSiswa,
  totalSiswaTerfilter,
  halamanSiswaAktif,
  onHalamanSebelumnya,
  onHalamanBerikutnya,
  isImporting,
  isExporting,
  onBerkasDipilih,
  onEkspor,
  onEksporTemplate,
  onTambahSiswa,
  onDetail,
  onEdit,
  onHapus,
}: SiswaSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-2xl bg-white p-6 shadow w-full">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#0F3D8C]">Data Siswa</h3>
          <p className="text-sm text-gray-500">
            Kelola dan pantau seluruh murid master Aksara Bimbel.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Import menerima file CSV/Excel dengan kolom sesuai template. Baris duplikat (nama + No
            HP sama) otomatis dilewati.
          </p>
          {(activeSiswaKelasFilter || activeSiswaPembayaranFilter) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0F3D8C]">
                Filter:{" "}
                {activeSiswaKelasFilter
                  ? formatKelas(activeSiswaKelasFilter)
                  : activeSiswaPembayaranFilter}
              </span>
              <button
                type="button"
                onClick={onResetFilters}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Tampilkan semua
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchQuery}
            onChange={(e) => onUbahSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] px-4 py-2 text-sm text-gray-900 bg-white outline-none focus:border-[#0F3D8C] sm:w-64"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={onBerkasDipilih}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="rounded-xl border border-[#0F3D8C] px-4 py-2 text-sm font-semibold text-[#0F3D8C] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              {isImporting ? "Mengimpor..." : "Import"}
            </button>

            <button
              type="button"
              onClick={() => onEkspor("csv")}
              disabled={isExporting}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => onEkspor("xlsx")}
              disabled={isExporting}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              Export Excel
            </button>

            <button
              type="button"
              onClick={onEksporTemplate}
              disabled={isExporting}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              Template
            </button>

            <button
              onClick={onTambahSiswa}
              className="rounded-xl bg-[#0F3D8C] px-5 py-2 font-semibold text-white hover:bg-[#0B2E69] whitespace-nowrap"
            >
              Tambah Siswa
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-[#D6B25E] bg-white shadow-inner">
        <table className="w-full min-w-max text-sm table-auto">
          <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Tanggal Masuk</th>
              <th className="px-4 py-3 text-left">Nama Lengkap</th>
              <th className="px-4 py-3 text-left">Panggilan</th>
              <th className="px-4 py-3 text-left">Kelas</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {halamanSiswa.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data siswa yang cocok
                </td>
              </tr>
            ) : (
              halamanSiswa.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(item.tanggalMasuk).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.namaLengkap}</td>
                  <td className="px-4 py-3 text-gray-600">{item.namaPanggilan}</td>
                  <td className="px-4 py-3 text-gray-600">{formatKelas(item.kelas)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => onDetail(item)}
                      className="mr-2 text-blue-600 hover:underline"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="mr-2 text-yellow-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onHapus(item.id, item.namaLengkap)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>
          Menampilkan {halamanSiswa.length} dari {totalSiswaTerfilter} siswa · Halaman{" "}
          {halamanSiswaAktif}
        </span>
        <div className="flex gap-2">
          {halamanSiswaAktif > 1 && (
            <button
              type="button"
              onClick={onHalamanSebelumnya}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Sebelumnya
            </button>
          )}
          {halamanSiswaAktif * BATCH_SISWA < totalSiswaTerfilter && (
            <button
              type="button"
              onClick={onHalamanBerikutnya}
              className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Berikutnya
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
