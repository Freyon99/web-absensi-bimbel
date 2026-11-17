import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { KELAS_OPTIONS } from "../lib/kelas"

function enumKelasDariSchema(): string[] {
  const jalur = fileURLToPath(new URL("../prisma/schema.prisma", import.meta.url))
  const isi = readFileSync(jalur, "utf8")
  const cocok = isi.match(/enum Kelas \{([\s\S]*?)\}/)

  if (!cocok) throw new Error("enum Kelas tidak ditemukan di prisma/schema.prisma")

  return cocok[1]
    .split("\n")
    .map((baris) => baris.trim())
    .filter(Boolean)
}

describe("KELAS_OPTIONS", () => {
  it("sejajar dengan enum Kelas di schema.prisma", () => {
    expect([...KELAS_OPTIONS]).toEqual(enumKelasDariSchema())
  })

  it("tidak mengandung duplikat", () => {
    expect(new Set(KELAS_OPTIONS).size).toBe(KELAS_OPTIONS.length)
  })
})
