import { describe, expect, it } from "vitest"
import { akhirHari, dariISOHari, keISOHari, mulaiHari, rentangHariISO } from "../lib/tanggal"

describe("tanggal", () => {
  it("mulaiHari menyetel 00:00:00.000", () => {
    const hasil = mulaiHari(new Date(2026, 10, 17, 15, 30, 12, 345))

    expect(hasil.getFullYear()).toBe(2026)
    expect(hasil.getMonth()).toBe(10)
    expect(hasil.getDate()).toBe(17)
    expect(hasil.getHours()).toBe(0)
    expect(hasil.getMinutes()).toBe(0)
    expect(hasil.getSeconds()).toBe(0)
    expect(hasil.getMilliseconds()).toBe(0)
  })

  it("akhirHari menyetel 23:59:59.999", () => {
    const hasil = akhirHari(new Date(2026, 0, 1, 1, 0, 0, 0))

    expect(hasil.getHours()).toBe(23)
    expect(hasil.getMinutes()).toBe(59)
    expect(hasil.getSeconds()).toBe(59)
    expect(hasil.getMilliseconds()).toBe(999)
  })

  it("dariISOHari membuat tengah malam lokal", () => {
    const d = dariISOHari("2026-11-17")

    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(10)
    expect(d.getDate()).toBe(17)
    expect(d.getHours()).toBe(0)
  })

  it("keISOHari memformat dua digit", () => {
    expect(keISOHari(new Date(2026, 0, 5))).toBe("2026-01-05")
  })

  it("rentangHariISO membungkus sehari penuh", () => {
    const { mulai, selesai } = rentangHariISO("2026-11-17")

    expect(keISOHari(mulai)).toBe("2026-11-17")
    expect(keISOHari(selesai)).toBe("2026-11-17")
    expect(selesai.getTime()).toBeGreaterThan(mulai.getTime())
  })
})
