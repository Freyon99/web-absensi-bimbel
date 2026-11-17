"use client"

import type { LogAbsenGuru } from "../types"

interface RiwayatAbsensiGuruProps {
  riwayat: LogAbsenGuru[]
}

export default function RiwayatAbsensiGuru({ riwayat }: RiwayatAbsensiGuruProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-[#0F3D8C]">Riwayat Kehadiran</h3>
        <p className="text-sm text-gray-500">Log absensi datang dan pulang Anda.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-max text-sm">
          <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Jam Datang</th>
              <th className="px-4 py-3 text-left">Jam Pulang</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  Belum ada riwayat kehadiran
                </td>
              </tr>
            ) : (
              riwayat.map((log) => {
                const dateObjMasuk = new Date(log.waktuMasuk)
                const dateObjPulang = log.waktuPulang ? new Date(log.waktuPulang) : null

                return (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {dateObjMasuk.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {dateObjMasuk.toLocaleTimeString("id-ID")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                      {dateObjPulang
                        ? dateObjPulang.toLocaleTimeString("id-ID")
                        : "Belum Absen Pulang"}
                    </td>
                    <td className="px-4 py-3">
                      {dateObjPulang ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Lengkap
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                          Belum Pulang
                        </span>
                      )}
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
