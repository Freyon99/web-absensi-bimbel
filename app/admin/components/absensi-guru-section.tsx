import type { LogAbsenGuru } from "../types"

interface AbsensiGuruSectionProps {
  absensiGuruTampil: LogAbsenGuru[]
  activeAbsensiGuruFilter: string
  onResetFilters: () => void
}

export default function AbsensiGuruSection({
  absensiGuruTampil,
  activeAbsensiGuruFilter,
  onResetFilters,
}: AbsensiGuruSectionProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow w-full">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-[#0F3D8C]">Monitoring Absensi Guru</h3>
        <p className="text-sm text-gray-500">
          Log kehadiran jam datang dan jam pulang seluruh tim pengajar.
        </p>
        {activeAbsensiGuruFilter && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Filter: {activeAbsensiGuruFilter}
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
      <div className="w-full overflow-x-auto rounded-xl border border-[#D6B25E] bg-white">
        <table className="w-full min-w-max text-sm table-auto">
          <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">Nama Guru</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Jam Datang</th>
              <th className="px-4 py-3 text-left">Jam Pulang</th>
            </tr>
          </thead>
          <tbody>
            {absensiGuruTampil.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada log absensi yang cocok
                </td>
              </tr>
            ) : (
              absensiGuruTampil.map((item) => {
                const dateObjMasuk = new Date(item.waktuMasuk)
                const dateObjPulang = item.waktuPulang ? new Date(item.waktuPulang) : null
                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 text-gray-700 font-semibold">
                      {item.guru?.nama || "Guru Terhapus"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {dateObjMasuk.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-bold">
                      {dateObjMasuk.toLocaleTimeString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-bold">
                      {dateObjPulang
                        ? dateObjPulang.toLocaleTimeString("id-ID")
                        : "Belum Absen Pulang"}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
