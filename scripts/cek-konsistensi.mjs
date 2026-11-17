// Cek konsistensi data yang mudah drift: enum `Kelas` di Prisma vs
// KELAS_OPTIONS di lib/kelas.ts. Dijalankan lewat `npm run cek:konsistensi`.
import { readFileSync } from "node:fs"

const schema = readFileSync("prisma/schema.prisma", "utf8")
const sumberKelas = readFileSync("lib/kelas.ts", "utf8")

const blokEnum = schema.match(/enum Kelas \{([\s\S]*?)\}/)?.[1] ?? ""
const enumKelas = [...blokEnum.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*$/gm)].map((m) => m[1])

const blokArray =
  sumberKelas.match(/export const KELAS_OPTIONS = \[([\s\S]*?)\] as const/)?.[1] ?? ""
const daftarKelas = [...blokArray.matchAll(/"([^"]+)"/g)].map((m) => m[1])

const hilang = enumKelas.filter((k) => !daftarKelas.includes(k))
const lebih = daftarKelas.filter((k) => !enumKelas.includes(k))

if (hilang.length > 0 || lebih.length > 0) {
  console.error("KELAS TIDAK SEJAJAR:")
  if (hilang.length > 0) {
    console.error("  Ada di Prisma, tidak ada di lib/kelas.ts:", hilang.join(", "))
  }
  if (lebih.length > 0) {
    console.error("  Ada di lib/kelas.ts, tidak ada di Prisma:", lebih.join(", "))
  }
  process.exit(1)
}

console.log(`OK: ${daftarKelas.length} kelas sejajar (Prisma = lib/kelas.ts)`)
