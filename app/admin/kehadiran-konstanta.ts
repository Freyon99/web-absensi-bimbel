export const STATUS_ABSENSI = [
  {
    value: "HADIR",
    label: "Hadir",
    select: "border-emerald-300 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
  {
    value: "IZIN",
    label: "Izin",
    select: "border-sky-300 text-sky-700",
    badge: "bg-sky-100 text-sky-800",
  },
  {
    value: "SAKIT",
    label: "Sakit",
    select: "border-amber-300 text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  {
    value: "ALPHA",
    label: "Alpha",
    select: "border-rose-300 text-rose-700",
    badge: "bg-rose-100 text-rose-800",
  },
]

export const STATUS_BADGE_STYLE = Object.fromEntries(
  STATUS_ABSENSI.map((s) => [s.value, s.badge]),
) as Record<string, string>

export const STATUS_LABEL = Object.fromEntries(
  STATUS_ABSENSI.map((s) => [s.value, s.label]),
) as Record<string, string>

// Tabel riwayat menampilkan 50 baris per halaman supaya render tetap ringan.
export const BATCH_RIWAYAT = 50
// Batas maksimal catatan yang dibolehkan server mengembalikan per rentang.
export const BATAS_RIWAYAT = 2000
