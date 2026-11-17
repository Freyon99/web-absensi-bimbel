"use client"

import type { FormEvent } from "react"
import { STATUS_ABSENSI } from "./kehadiran-konstanta"
import { formatKelas } from "@/lib/kelas"
import type { LogAbsensiMurid } from "./kehadiran-tipe"

export function ModalKoreksiAbsensi({
  absensiTerpilih,
  statusKoreksi,
  onStatusKoreksi,
  isMenyimpanKoreksi,
  onSubmit,
  onBatal,
}: {
  absensiTerpilih: LogAbsensiMurid
  statusKoreksi: string
  onStatusKoreksi: (status: string) => void
  isMenyimpanKoreksi: boolean
  onSubmit: (e: FormEvent) => void
  onBatal: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl text-gray-900 border"
      >
        <h3 className="text-xl font-bold text-[#0F3D8C]">Koreksi Absensi Siswa</h3>

        <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-800">{absensiTerpilih.murid.namaLengkap}</span>
            {" · "}
            {formatKelas(absensiTerpilih.murid.kelas)}
          </p>
          <p className="mt-1">
            {new Date(absensiTerpilih.tanggal).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" · "}
            Dicatat oleh {absensiTerpilih.guru?.nama || "Pengguna Terhapus"}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">Status Kehadiran</label>
          <select
            value={statusKoreksi}
            onChange={(e) => onStatusKoreksi(e.target.value)}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          >
            {STATUS_ABSENSI.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBatal}
            className="flex-1 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-700 hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isMenyimpanKoreksi}
            className="flex-1 rounded-xl bg-[#0F3D8C] py-2.5 font-semibold text-white hover:bg-[#0B2E69] disabled:bg-gray-400"
          >
            {isMenyimpanKoreksi ? "Menyimpan..." : "Simpan Koreksi"}
          </button>
        </div>
      </form>
    </div>
  )
}
