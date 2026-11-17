// Helper tanggal lokal (WIB) yang dipakai bersama oleh server dan klien.
// Semua batas hari memakai waktu server-local, sejajar dengan POST /api/absensi.

export function mulaiHari(d: Date) {
  const hasil = new Date(d)
  hasil.setHours(0, 0, 0, 0)
  return hasil
}

export function akhirHari(d: Date) {
  const hasil = new Date(d)
  hasil.setHours(23, 59, 59, 999)
  return hasil
}

/** "2026-11-17" -> Date tengah malam lokal pada tanggal itu. */
export function dariISOHari(iso: string) {
  const [tahun, bulan, tanggal] = iso.split("-").map(Number)
  return new Date(tahun, bulan - 1, tanggal)
}

export function keISOHari(d: Date) {
  const bulan = String(d.getMonth() + 1).padStart(2, "0")
  const tanggal = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${bulan}-${tanggal}`
}

export function rentangHariISO(iso: string) {
  const d = dariISOHari(iso)
  return { mulai: mulaiHari(d), selesai: akhirHari(d) }
}
