import { akhirHari, mulaiHari } from "@/lib/tanggal"

export type ModePeriode = "HARIAN" | "MINGGUAN" | "BULANAN"

export const MODE_PERIODE_OPTIONS: { value: ModePeriode; label: string }[] = [
  { value: "HARIAN", label: "Harian" },
  { value: "MINGGUAN", label: "Mingguan" },
  { value: "BULANAN", label: "Bulanan" },
]

// Pekan dimulai hari Senin (konvensi Indonesia).
export function mulaiMinggu(d: Date) {
  const hasil = mulaiHari(d)
  const selisih = (hasil.getDay() + 6) % 7
  hasil.setDate(hasil.getDate() - selisih)
  return hasil
}

export function akhirMinggu(d: Date) {
  const hasil = mulaiMinggu(d)
  hasil.setDate(hasil.getDate() + 6)
  return akhirHari(hasil)
}

export function mulaiBulan(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

export function akhirBulan(d: Date) {
  return akhirHari(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

export function tambahHari(d: Date, selisih: number) {
  const hasil = new Date(d)
  hasil.setDate(hasil.getDate() + selisih)
  return hasil
}

export function tambahBulan(d: Date, selisih: number) {
  const hasil = new Date(d)
  hasil.setMonth(hasil.getMonth() + selisih)
  return hasil
}

export function formatRentang(mulai: Date, selesai: Date, mode: ModePeriode) {
  if (mode === "MINGGUAN") {
    const awal = mulai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    const akhir = selesai.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    return `${awal} – ${akhir}`
  }

  if (mode === "BULANAN") {
    return selesai.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
  }

  return mulai.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function dalamRentang(tanggal: string, mulai: Date, selesai: Date) {
  const d = new Date(tanggal)
  return d >= mulai && d <= selesai
}
