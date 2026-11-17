import type { FormEvent } from "react"
import { KELAS_OPTIONS, formatKelas } from "@/lib/kelas"
import type { FormSiswa, ModalAdmin, Murid } from "../types"

interface ModalFormSiswaProps {
  modalType: ModalAdmin
  formSiswa: FormSiswa
  onUbahFormSiswa: (nilai: FormSiswa) => void
  onSubmitTambah: (e: FormEvent) => void
  onSubmitEdit: (e: FormEvent) => void
  onClose: () => void
}

export function ModalFormSiswa({
  modalType,
  formSiswa,
  onUbahFormSiswa,
  onSubmitTambah,
  onSubmitEdit,
  onClose,
}: ModalFormSiswaProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={modalType === "tambahSiswa" ? onSubmitTambah : onSubmitEdit}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900 border"
      >
        <h3 className="text-xl font-bold text-[#0F3D8C] col-span-full">
          {modalType === "tambahSiswa" ? "Tambah Siswa Baru" : "Edit Informasi Murid"}
        </h3>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Nama Lengkap</label>
          <input
            type="text"
            required
            value={formSiswa.namaLengkap}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, namaLengkap: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Nama Panggilan</label>
          <input
            type="text"
            required
            value={formSiswa.namaPanggilan}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, namaPanggilan: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Kelas Tingkat</label>
          <select
            value={formSiswa.kelas}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, kelas: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          >
            {KELAS_OPTIONS.map((kelas) => (
              <option key={kelas} value={kelas}>
                {formatKelas(kelas)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Sekolah Asal</label>
          <input
            type="text"
            required
            value={formSiswa.sekolahAsal}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, sekolahAsal: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Nama Orang Tua/Wali</label>
          <input
            type="text"
            required
            value={formSiswa.namaOrangTuaWali}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, namaOrangTuaWali: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold">Pekerjaan Ayah</label>

          <input
            type="text"
            value={formSiswa.pekerjaanAyah}
            onChange={(e) =>
              onUbahFormSiswa({
                ...formSiswa,
                pekerjaanAyah: e.target.value,
              })
            }
            className="w-full rounded-lg border p-2.5"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold">Pekerjaan Ibu</label>

          <input
            type="text"
            value={formSiswa.pekerjaanIbu}
            onChange={(e) =>
              onUbahFormSiswa({
                ...formSiswa,
                pekerjaanIbu: e.target.value,
              })
            }
            className="w-full rounded-lg border p-2.5"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">No HP Kontak</label>
          <input
            type="text"
            required
            value={formSiswa.noHpOrangTua}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, noHpOrangTua: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Hari Les</label>
          <input
            type="text"
            placeholder="Senin, Rabu"
            required
            value={formSiswa.hari}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, hari: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Jam Les</label>
          <input
            type="text"
            placeholder="14:00 - 16:00"
            required
            value={formSiswa.jam}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, jam: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Mata Pelajaran</label>
          <input
            type="text"
            placeholder="Matematika, IPA"
            required
            value={formSiswa.mapel}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, mapel: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Status Pembayaran</label>
          <select
            value={formSiswa.pembayaran}
            onChange={(e) => onUbahFormSiswa({ ...formSiswa, pembayaran: e.target.value })}
            className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          >
            <option value="LUNAS">LUNAS</option>
            <option value="BELUM LUNAS">BELUM LUNAS</option>
          </select>
        </div>

        <div className="col-span-full space-y-2">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Alamat Domisili</label>
            <textarea
              required
              value={formSiswa.alamatDomisili}
              onChange={(e) => onUbahFormSiswa({ ...formSiswa, alamatDomisili: e.target.value })}
              className="w-full rounded-lg border p-2 h-16 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Catatan Kondisi Anak (Opsional)
            </label>
            <input
              type="text"
              value={formSiswa.catatanAnak || ""}
              onChange={(e) => onUbahFormSiswa({ ...formSiswa, catatanAnak: e.target.value })}
              className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
            />
          </div>
        </div>

        <div className="col-span-full flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-700 hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#0F3D8C] py-2.5 font-semibold text-white hover:bg-[#0B2E69]"
          >
            Simpan Data
          </button>
        </div>
      </form>
    </div>
  )
}

interface ModalDetailSiswaProps {
  siswa: Murid | null
  onClose: () => void
}

export function ModalDetailSiswa({ siswa, onClose }: ModalDetailSiswaProps) {
  if (!siswa) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-sm text-gray-900 border border-gray-100">
        <h3 className="text-lg font-bold text-[#0F3D8C] border-b pb-2 flex items-center gap-2">
          📋 Kartu Informasi Murid
        </h3>

        <div className="space-y-2.5 divide-y divide-gray-50 max-h-[60vh] overflow-y-auto pr-1">
          <p className="pt-1">
            <span className="font-bold text-gray-500 block text-xs uppercase">Nama Lengkap</span>
            <span className="text-gray-900 font-semibold text-base">{siswa.namaLengkap}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">Nama Panggilan</span>
            <span className="text-gray-800">{siswa.namaPanggilan}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">Kelas Tingkat</span>
            <span className="text-gray-800">{formatKelas(siswa.kelas)}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">Sekolah Asal</span>
            <span className="text-gray-800">{siswa.sekolahAsal}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">
              Wali / Orang Tua
            </span>
            <span className="text-gray-800">{siswa.namaOrangTuaWali}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">Pekerjaan Ayah</span>
            <span className="text-gray-800">{siswa.pekerjaanAyah || "-"}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">Pekerjaan Ibu</span>
            <span className="text-gray-800">{siswa.pekerjaanIbu || "-"}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">No HP Kontak</span>
            <span className="text-gray-800 font-mono font-medium">{siswa.noHpOrangTua}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">Alamat Domisili</span>
            <span className="text-gray-800">{siswa.alamatDomisili}</span>
          </p>

          <p className="pt-2">
            <span className="font-bold text-gray-500 block text-xs uppercase">
              Jadwal & Mata Pelajaran
            </span>
            <span className="text-gray-800 font-medium">
              {siswa.mapel} ({siswa.hari} / {siswa.jam} WIB)
            </span>
          </p>

          <p className="pt-2 flex items-center justify-between">
            <span className="font-bold text-gray-500 text-xs uppercase">Status Pembayaran</span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                siswa.pembayaran === "LUNAS"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {siswa.pembayaran}
            </span>
          </p>

          <p className="pt-2 font-medium italic text-gray-700 bg-gray-50 p-2.5 rounded-xl border">
            <strong>Catatan:</strong> {siswa.catatanAnak || "Tidak ada catatan khusus."}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 rounded-xl bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800 transition"
        >
          Tutup Detail
        </button>
      </div>
    </div>
  )
}
