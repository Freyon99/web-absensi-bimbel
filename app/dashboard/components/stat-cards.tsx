"use client"

import { KELAS_OPTIONS } from "@/lib/kelas"

interface StatCardsProps {
  totalSiswa: number
  sudahAbsenDatang: boolean
  sudahAbsenPulang: boolean
  totalAbsenGuru: number
}

export default function StatCards({
  totalSiswa,
  sudahAbsenDatang,
  sudahAbsenPulang,
  totalAbsenGuru,
}: StatCardsProps) {
  return (
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
        <p className="mt-3 text-3xl font-bold text-[#0F3D8C]">{totalSiswa}</p>
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
  )
}
