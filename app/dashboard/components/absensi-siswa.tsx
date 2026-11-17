"use client"

import type { Dispatch, SetStateAction } from "react"
import type { Murid, UserProfile } from "../types"
import { formatKelas } from "@/lib/kelas"
import { STATUS_OPTIONS, STATUS_SELECT_STYLE } from "../constants"

interface AbsensiSiswaProps {
  user: UserProfile
  kelasAktif: string
  muridPerKelas: Murid[]
  muridBelumAbsen: Murid[]
  jumlahHadir: number
  jumlahTerabsen: number
  absenSiswa: Record<string, string>
  setAbsenSiswa: Dispatch<SetStateAction<Record<string, string>>>
  isLoading: boolean
  onSimpan: () => void
  onTandaiSemuaHadir: () => void
  onReset: () => void
}

export default function AbsensiSiswa({
  user,
  kelasAktif,
  muridPerKelas,
  muridBelumAbsen,
  jumlahHadir,
  jumlahTerabsen,
  absenSiswa,
  setAbsenSiswa,
  isLoading,
  onSimpan,
  onTandaiSemuaHadir,
  onReset,
}: AbsensiSiswaProps) {
  return (
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
            onClick={onTandaiSemuaHadir}
            className="rounded-lg border border-gray-200 px-3 py-1 font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Semua Hadir
          </button>

          <button
            type="button"
            onClick={onReset}
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
                  <span className="font-bold text-red-500">Kelas {formatKelas(kelasAktif)}</span> di
                  database.
                </td>
              </tr>
            ) : muridBelumAbsen.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-gray-400">
                  Semua murid{" "}
                  <span className="font-bold text-[#0F3D8C]">Kelas {formatKelas(kelasAktif)}</span>{" "}
                  sudah diabsen hari ini dan tidak bisa diabsen ulang. Koreksi hanya bisa dilakukan
                  admin.
                </td>
              </tr>
            ) : (
              muridBelumAbsen.map((murid, index) => {
                const status = absenSiswa[murid.id] || "ALPHA"

                return (
                  <tr key={murid.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-600">{index + 1}</td>
                    <td className="px-5 py-4 font-semibold text-gray-700">{murid.namaLengkap}</td>
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
            onClick={onSimpan}
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
  )
}
