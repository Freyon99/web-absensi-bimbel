import { formatKelas } from "@/lib/kelas"
import type { DataGrafik, DataGrafikKelas } from "../utils"
import type { Murid, RingkasanSiswa, UserProfile } from "../types"

interface DashboardSectionProps {
  dashboardSearch: string
  onUbahDashboardSearch: (nilai: string) => void
  ringkasan: RingkasanSiswa
  totalGuru: number
  totalAbsenGuru: number
  totalAbsensiSelesai: number
  siswaKelas: DataGrafikKelas[]
  maksSiswaKelas: number
  absensiGuru: DataGrafik[]
  maksAbsensiGuru: number
  siswaPembayaran: DataGrafik[]
  dashboardSiswaResults: Murid[]
  dashboardGuruResults: UserProfile[]
  onBukaSiswaByKelas: (kelas: string) => void
  onBukaSiswaByPembayaran: (pembayaran: string) => void
  onBukaAbsensiByGuru: (namaGuru: string) => void
  onBukaDetailSiswa: (siswa: Murid) => void
}

export default function DashboardSection({
  dashboardSearch,
  onUbahDashboardSearch,
  ringkasan,
  totalGuru,
  totalAbsenGuru,
  totalAbsensiSelesai,
  siswaKelas,
  maksSiswaKelas,
  absensiGuru,
  maksAbsensiGuru,
  siswaPembayaran,
  dashboardSiswaResults,
  dashboardGuruResults,
  onBukaSiswaByKelas,
  onBukaSiswaByPembayaran,
  onBukaAbsensiByGuru,
  onBukaDetailSiswa,
}: DashboardSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#D6B25E]">
            Dashboard Admin
          </p>
          <h2 className="text-3xl font-bold text-[#0F3D8C]">Statistik Siswa & Guru</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ringkasan ini otomatis mengikuti data terbaru dari database.
          </p>
        </div>
        <div className="w-full lg:max-w-md">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Search siswa atau guru
          </label>
          <input
            type="text"
            placeholder="Cari nama, kelas, sekolah, email, atau no HP..."
            value={dashboardSearch}
            onChange={(e) => onUbahDashboardSearch(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#0F3D8C] focus:ring-2 focus:ring-[#0F3D8C]/10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Total Siswa</p>
          <p className="mt-2 text-3xl font-bold text-[#0F3D8C]">{ringkasan.total}</p>
          <p className="mt-1 text-xs text-gray-400">Anak terdaftar</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Total Guru</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{totalGuru}</p>
          <p className="mt-1 text-xs text-gray-400">Pengajar aktif</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Absensi Guru</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{totalAbsenGuru}</p>
          <p className="mt-1 text-xs text-gray-400">{totalAbsensiSelesai} sudah absen pulang</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Pembayaran Lunas</p>
          <p className="mt-2 text-3xl font-bold text-rose-700">{ringkasan.lunas}</p>
          <p className="mt-1 text-xs text-gray-400">Dari total siswa</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0F3D8C]">Grafik Siswa per Kelas</h3>
              <p className="text-sm text-gray-500">Distribusi siswa berdasarkan tingkat kelas.</p>
            </div>
          </div>
          <div className="h-64">
            {siswaKelas.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-400">
                Belum ada data siswa
              </p>
            ) : (
              <div className="flex h-full items-end gap-3 overflow-x-auto border-b border-l border-gray-100 px-2 pb-2">
                {siswaKelas.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onBukaSiswaByKelas(item.raw)}
                    title={`Lihat data siswa kelas ${item.label}`}
                    className="group flex h-full min-w-16 flex-1 flex-col items-center justify-end gap-2 rounded-lg px-1 py-2 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#0F3D8C]/20"
                  >
                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                    <span className="flex h-40 w-full items-end justify-center">
                      <span
                        className="w-full max-w-12 rounded-t-lg bg-[#0F3D8C] transition-all group-hover:bg-[#0B2E69]"
                        style={{
                          height: `${Math.max((item.value / maksSiswaKelas) * 100, 12)}%`,
                        }}
                      />
                    </span>
                    <span className="w-full truncate text-center text-xs font-semibold text-gray-600">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-[#0F3D8C]">Grafik Aktivitas Guru</h3>
            <p className="text-sm text-gray-500">Jumlah log absensi yang tercatat per guru.</p>
          </div>
          <div className="h-64">
            {absensiGuru.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-400">
                Belum ada log absensi guru
              </p>
            ) : (
              <div className="flex h-full items-end gap-3 overflow-x-auto border-b border-l border-gray-100 px-2 pb-2">
                {absensiGuru.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onBukaAbsensiByGuru(item.label)}
                    title={`Lihat absensi ${item.label}`}
                    className="group flex h-full min-w-16 flex-1 flex-col items-center justify-end gap-2 rounded-lg px-1 py-2 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  >
                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                    <span className="flex h-40 w-full items-end justify-center">
                      <span
                        className="w-full max-w-12 rounded-t-lg bg-emerald-600 transition-all group-hover:bg-emerald-700"
                        style={{
                          height: `${Math.max((item.value / maksAbsensiGuru) * 100, 12)}%`,
                        }}
                      />
                    </span>
                    <span className="w-full truncate text-center text-xs font-semibold text-gray-600">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-[#0F3D8C]">Hasil Search</h3>
            <p className="text-sm text-gray-500">
              Menampilkan siswa dan guru yang cocok dengan kata kunci.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold text-gray-700">
                Siswa ({dashboardSiswaResults.length})
              </p>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100">
                {dashboardSiswaResults.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onBukaDetailSiswa(item)}
                    className="block w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                  >
                    <span className="block font-semibold text-gray-900">{item.namaLengkap}</span>
                    <span className="text-xs text-gray-500">
                      {formatKelas(item.kelas)} - {item.sekolahAsal}
                    </span>
                  </button>
                ))}
                {dashboardSiswaResults.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">
                    Tidak ada siswa ditemukan
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-bold text-gray-700">
                Guru ({dashboardGuruResults.length})
              </p>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-100">
                {dashboardGuruResults.slice(0, 8).map((item) => (
                  <div key={item.id} className="border-b border-gray-100 px-4 py-3 last:border-b-0">
                    <p className="font-semibold text-gray-900">{item.nama}</p>
                    <p className="text-xs text-gray-500">{item.email}</p>
                    <p className="text-xs text-gray-500">{item.noHp || "-"}</p>
                  </div>
                ))}
                {dashboardGuruResults.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">
                    Tidak ada guru ditemukan
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0F3D8C]">Status Pembayaran</h3>
          <div className="mt-5 h-56">
            {siswaPembayaran.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-400">
                Belum ada data pembayaran
              </p>
            ) : (
              <div className="flex h-full items-end gap-4 border-b border-l border-gray-100 px-2 pb-2">
                {siswaPembayaran.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onBukaSiswaByPembayaran(item.label)}
                    title={`Lihat data siswa dengan pembayaran ${item.label}`}
                    className="group flex h-full min-w-24 flex-1 flex-col items-center justify-end gap-2 rounded-lg px-2 py-2 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-[#D6B25E]/30"
                  >
                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                    <span className="flex h-32 w-full items-end justify-center">
                      <span
                        className="w-full max-w-16 rounded-t-lg bg-[#D6B25E] transition-all group-hover:bg-amber-600"
                        style={{
                          height: `${Math.max((item.value / Math.max(ringkasan.total, 1)) * 100, 12)}%`,
                        }}
                      />
                    </span>
                    <span className="w-full truncate text-center text-xs font-semibold text-gray-600">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
