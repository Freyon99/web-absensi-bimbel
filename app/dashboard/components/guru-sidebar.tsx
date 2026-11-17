"use client"

import { KELAS_OPTIONS, formatKelas } from "@/lib/kelas"

interface GuruSidebarProps {
  menuAktif: string
  kelasAktif: string
  sisaPerKelas: Record<string, number>
  onPilihAbsensiGuru: () => void
  onPilihKelas: (kelas: string) => void
}

export default function GuruSidebar({
  menuAktif,
  kelasAktif,
  sisaPerKelas,
  onPilihAbsensiGuru,
  onPilihKelas,
}: GuruSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <button
        onClick={onPilihAbsensiGuru}
        className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
          menuAktif === "Absensi Guru"
            ? "bg-[#D6B25E] text-[#0F3D8C] shadow-lg"
            : "bg-[#174894] text-white hover:bg-[#2157ad]"
        }`}
      >
        <svg
          className={`h-5 w-5 ${menuAktif === "Absensi Guru" ? "text-[#0F3D8C]" : "text-blue-200"}`}
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
        <span className="font-semibold">Absensi Guru</span>
      </button>

      <p className="mt-6 px-2 text-xs font-bold uppercase tracking-widest text-blue-200/70">
        Daftar Kelas
      </p>

      <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto">
        {KELAS_OPTIONS.map((kelas) => {
          const aktif = menuAktif === "Absensi Siswa" && kelasAktif === kelas
          const sisa = sisaPerKelas[kelas] ?? 0

          return (
            <button
              key={kelas}
              onClick={() => onPilihKelas(kelas)}
              className={`group flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-left transition-all duration-200 ${
                aktif
                  ? "bg-[#D6B25E] text-[#0F3D8C] shadow-lg"
                  : "bg-[#174894] text-white hover:bg-[#2157ad]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${aktif ? "bg-[#0F3D8C]" : "bg-blue-200"}`}
                />
                <span className="font-medium">{formatKelas(kelas)}</span>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  aktif ? "bg-[#0F3D8C]/10 text-[#0F3D8C]" : "bg-white/10 text-blue-100"
                }`}
              >
                {sisa}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
