import { fetchApi } from "@/lib/api-client"
import { formatKelas } from "@/lib/kelas"
import type { LogAbsenGuru, RingkasanSiswa } from "./types"

export interface DataGrafik {
  label: string
  value: number
}

export interface DataGrafikKelas extends DataGrafik {
  raw: string
}

// Unduh file (CSV/Excel) dari server lalu simpan lewat anchor,
export async function unduhFile(url: string, namaCadangan: string) {
  const res = await fetchApi(url)

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.message || "Gagal mengunduh file.")
  }

  const blob = await res.blob()
  const disposition = res.headers.get("Content-Disposition") || ""
  const cocok = /filename="?([^";]+)"?/i.exec(disposition)

  const urlObjek = URL.createObjectURL(blob)
  const penghubung = document.createElement("a")
  penghubung.href = urlObjek
  penghubung.download = cocok?.[1] || namaCadangan
  document.body.appendChild(penghubung)
  penghubung.click()
  penghubung.remove()
  URL.revokeObjectURL(urlObjek)
}

export function countByField<T>(items: T[], getKey: (item: T) => string | null | undefined) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getKey(item)?.trim() || "Tidak Diisi"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

export function toChartData(data: Record<string, number>, limit = 8) {
  return Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}

export function siswaByKelas(ringkasan: RingkasanSiswa): DataGrafikKelas[] {
  return Object.entries(ringkasan.perKelas)
    .map(([kelas, value]) => ({ label: formatKelas(kelas), raw: kelas, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

export function siswaByPembayaran(ringkasan: RingkasanSiswa): DataGrafik[] {
  return Object.entries(ringkasan.perPembayaran)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
}

export function absensiByGuru(list: LogAbsenGuru[]): DataGrafik[] {
  return toChartData(countByField(list, (a) => a.guru?.nama || "Guru Terhapus"))
}

export function totalAbsensiSelesai(list: LogAbsenGuru[]): number {
  return list.filter((a) => Boolean(a.waktuPulang)).length
}
