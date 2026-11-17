import type { FormGuru, FormSiswa, MenuAdmin, RingkasanSiswa } from "./types"

// Tabel Data Siswa menampilkan 50 baris per halaman supaya render tetap ringan.
export const BATCH_SISWA = 50

export const MENU_ADMIN: MenuAdmin[] = [
  "Dashboard",
  "Data Siswa",
  "Data Guru",
  "Absensi Guru",
  "Absensi Siswa",
]

export const RINGKASAN_SISWA_AWAL: RingkasanSiswa = {
  total: 0,
  perKelas: {},
  perPembayaran: {},
  lunas: 0,
  belumLunas: 0,
}

export const FORM_GURU_AWAL: FormGuru = { nama: "", email: "", password: "", noHp: "" }

export const FORM_SISWA_AWAL: FormSiswa = {
  namaLengkap: "",
  namaPanggilan: "",
  kelas: "CALISTUNG",
  sekolahAsal: "",
  namaOrangTuaWali: "",
  pekerjaanAyah: "",
  pekerjaanIbu: "",
  alamatDomisili: "",
  noHpOrangTua: "",
  hari: "",
  jam: "",
  pembayaran: "BELUM LUNAS",
  mapel: "",
  catatanAnak: "",
}
