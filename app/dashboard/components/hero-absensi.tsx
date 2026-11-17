"use client"

import { formatTanggalHariIni } from "../constants"

interface HeroAbsensiProps {
  nama: string
  isLoading: boolean
  sudahAbsenDatang: boolean
  sudahAbsenPulang: boolean
  jamDatang: string | null
  jamPulang: string | null
  totalAbsensi: number
  onAbsenDatang: () => void
  onAbsenPulang: () => void
}

export default function HeroAbsensi({
  nama,
  isLoading,
  sudahAbsenDatang,
  sudahAbsenPulang,
  jamDatang,
  jamPulang,
  totalAbsensi,
  onAbsenDatang,
  onAbsenPulang,
}: HeroAbsensiProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#0F3D8C] p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#D6B25E]">
            {formatTanggalHariIni()}
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            Selamat datang, {nama.split(" ")[0]}!
          </h2>
          <p className="mt-2 max-w-xl text-sm text-blue-100">
            {sudahAbsenPulang
              ? "Anda sudah menyelesaikan absensi hari ini. Terima kasih atas dedikasinya!"
              : sudahAbsenDatang
                ? `Absen datang tercatat pukul ${jamDatang}. Jangan lupa catat absen pulang sebelum berangkat.`
                : "Catat kehadiran Anda hari ini dan pantau kehadiran siswa per kelas."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onAbsenDatang}
              disabled={isLoading || sudahAbsenDatang}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D6B25E] px-5 py-2.5 font-semibold text-[#0F3D8C] shadow-md transition hover:bg-[#c7a34e] active:scale-95 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/70"
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
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {sudahAbsenDatang ? "Sudah Absen Datang" : "Absen Datang"}
            </button>

            <button
              onClick={onAbsenPulang}
              disabled={isLoading || !sudahAbsenDatang || sudahAbsenPulang}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 font-semibold text-white transition hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              {sudahAbsenPulang ? "Sudah Absen Pulang" : "Absen Pulang"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:w-90">
          <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
            <p className="text-2xl font-bold text-[#D6B25E]">
              {sudahAbsenDatang ? jamDatang : "--:--"}
            </p>
            <p className="mt-1 text-xs text-blue-100">Jam Datang</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
            <p className="text-2xl font-bold text-[#D6B25E]">
              {sudahAbsenPulang ? jamPulang : "--:--"}
            </p>
            <p className="mt-1 text-xs text-blue-100">Jam Pulang</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
            <p className="text-2xl font-bold text-[#D6B25E]">{totalAbsensi}</p>
            <p className="mt-1 text-xs text-blue-100">Total Absensi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
