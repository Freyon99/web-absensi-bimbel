import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cekRateLimiter } from "../lib/rate-limit"

const WINDOW_MS = 15 * 60 * 1000

describe("cekRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("mengizinkan 5 percobaan lalu menolak", () => {
    for (let i = 0; i < 5; i++) {
      expect(cekRateLimiter("email:a@b.c")).toEqual({ ok: true, cobaLagiDalamDetik: 0 })
    }

    const ditolak = cekRateLimiter("email:a@b.c")
    expect(ditolak.ok).toBe(false)
    expect(ditolak.cobaLagiDalamDetik).toBeGreaterThan(0)
  })

  it("jendela direset setelah 15 menit", () => {
    for (let i = 0; i < 5; i++) cekRateLimiter("email:d@e.f")
    expect(cekRateLimiter("email:d@e.f").ok).toBe(false)

    vi.advanceTimersByTime(WINDOW_MS + 1)

    expect(cekRateLimiter("email:d@e.f")).toEqual({ ok: true, cobaLagiDalamDetik: 0 })
  })

  it("kunci berbeda tidak saling memengaruhi", () => {
    for (let i = 0; i < 5; i++) cekRateLimiter("email:a@b.c")

    expect(cekRateLimiter("email:a@b.c").ok).toBe(false)
    expect(cekRateLimiter("email:x@y.z").ok).toBe(true)
  })
})
