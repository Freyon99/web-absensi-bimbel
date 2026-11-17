// Sumber tunggal daftar kelas. Harus sejalan dengan enum `Kelas` di
// prisma/schema.prisma. Dipakai bersama oleh halaman admin dan dashboard guru
// supaya tidak ada kelas yang tertinggal di salah satu sisi.
export const KELAS_OPTIONS = [
  "CALISTUNG",
  "SD_1",
  "SD_2",
  "SD_3",
  "SD_4",
  "SD_5",
  "SD_6",
  "SMP_1",
  "SMP_2",
  "SMP_3",
  "SMK_1",
  "SMK_2",
  "SMK_3",
] as const

export type Kelas = (typeof KELAS_OPTIONS)[number]

/** "SD_1" -> "SD 1" untuk tampilan. */
export function formatKelas(kelas: string): string {
  return kelas.replaceAll("_", " ")
}
