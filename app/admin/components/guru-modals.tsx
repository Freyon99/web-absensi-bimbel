import type { FormEvent } from "react"
import type { FormGuru } from "../types"

interface ModalTambahGuruProps {
  formGuru: FormGuru
  onUbahFormGuru: (nilai: FormGuru) => void
  onSubmit: (e: FormEvent) => void
  onClose: () => void
}

export function ModalTambahGuru({
  formGuru,
  onUbahFormGuru,
  onSubmit,
  onClose,
}: ModalTambahGuruProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-gray-900 border"
      >
        <h3 className="text-xl font-bold text-[#0F3D8C]">Daftarkan Guru Baru</h3>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">Nama Pengajar</label>
          <input
            type="text"
            required
            value={formGuru.nama}
            onChange={(e) => onUbahFormGuru({ ...formGuru, nama: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">No HP Kontak</label>
          <input
            type="text"
            required
            placeholder="Contoh: 081234567890"
            value={formGuru.noHp}
            onChange={(e) => onUbahFormGuru({ ...formGuru, noHp: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={formGuru.email}
            onChange={(e) => onUbahFormGuru({ ...formGuru, email: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">
            Password Aplikasi
          </label>
          <input
            type="password"
            required
            value={formGuru.password}
            onChange={(e) => onUbahFormGuru({ ...formGuru, password: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div className="flex gap-3 pt-2">
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
            Simpan
          </button>
        </div>
      </form>
    </div>
  )
}

interface ModalEditGuruProps {
  formGuru: FormGuru
  onUbahFormGuru: (nilai: FormGuru) => void
  onSubmit: (e: FormEvent) => void
  onClose: () => void
}

export function ModalEditGuru({ formGuru, onUbahFormGuru, onSubmit, onClose }: ModalEditGuruProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-gray-900 border"
      >
        <h3 className="text-xl font-bold text-[#0F3D8C]">Edit Informasi Pengajar</h3>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">Nama Pengajar</label>
          <input
            type="text"
            required
            value={formGuru.nama}
            onChange={(e) => onUbahFormGuru({ ...formGuru, nama: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">No HP Kontak</label>
          <input
            type="text"
            required
            value={formGuru.noHp}
            onChange={(e) => onUbahFormGuru({ ...formGuru, noHp: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">Email Hak Akses</label>
          <input
            type="email"
            required
            value={formGuru.email}
            onChange={(e) => onUbahFormGuru({ ...formGuru, email: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block text-gray-700 mb-1">
            Password Baru (Kosongkan jika tidak diubah)
          </label>
          <input
            type="password"
            placeholder="Minimal 8 karakter"
            value={formGuru.password}
            onChange={(e) => onUbahFormGuru({ ...formGuru, password: e.target.value })}
            className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
          />
        </div>
        <div className="flex gap-3 pt-2">
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
            Perbarui Data
          </button>
        </div>
      </form>
    </div>
  )
}
