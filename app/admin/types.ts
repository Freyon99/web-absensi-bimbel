export interface UserProfile {
  id: string
  nama: string
  email: string
  peran: string
  noHp?: string // Tambahkan properti opsional noHp
}

export interface Murid {
  id: string
  tanggalMasuk: string
  namaLengkap: string
  namaPanggilan: string
  kelas: string
  sekolahAsal: string
  namaOrangTuaWali: string
  pekerjaanAyah: string
  pekerjaanIbu: string
  alamatDomisili: string
  noHpOrangTua: string
  hari: string
  jam: string
  pembayaran: string
  mapel: string
  catatanAnak: string | null
}

export interface LogAbsenGuru {
  id: string
  waktuMasuk: string
  waktuPulang: string | null
  guru: { nama: string }
}

export interface RingkasanImport {
  total: number
  success: number
  skipped: number
  failed: number
}

export interface HasilImport {
  message: string
  summary: RingkasanImport
  errors: { row: number; message: string }[]
}

export interface RingkasanSiswa {
  total: number
  perKelas: Record<string, number>
  perPembayaran: Record<string, number>
  lunas: number
  belumLunas: number
}

export interface FormGuru {
  nama: string
  email: string
  password: string
  noHp: string
}

export interface FormSiswa {
  namaLengkap: string
  namaPanggilan: string
  kelas: string
  sekolahAsal: string
  namaOrangTuaWali: string
  pekerjaanAyah: string
  pekerjaanIbu: string
  alamatDomisili: string
  noHpOrangTua: string
  hari: string
  jam: string
  pembayaran: string
  mapel: string
  catatanAnak: string
}

export type MenuAdmin = "Dashboard" | "Data Siswa" | "Data Guru" | "Absensi Guru" | "Absensi Siswa"

export type ModalAdmin =
  "tambahGuru" | "editGuru" | "tambahSiswa" | "editSiswa" | "detailSiswa" | null

export type TampilkanNotifikasi = (title: string, message: string, isSuccess?: boolean) => void

export type TampilkanKonfirmasi = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText?: string,
) => void
