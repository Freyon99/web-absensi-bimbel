interface EntriRateLimiter {
  count: number
  resetAt: number
}

// Batas retry sederhana di memori server (per instance).
// Cukup untuk mencegah brute-force massal pada aplikasi skala bimbel.
const WINDOW_MS = 15 * 60 * 1000
const MAKS_PER_WINDOW = 5
const store = new Map<string, EntriRateLimiter>()

export function cekRateLimiter(kunci: string): {
  ok: boolean
  cobaLagiDalamDetik: number
} {
  const now = Date.now()

  // Bersihkan entri kedaluwarsa bila map mulai besar.
  if (store.size > 1000) {
    for (const [kunciLama, entri] of store) {
      if (entri.resetAt < now) store.delete(kunciLama)
    }
  }

  const entri = store.get(kunci)

  if (!entri || entri.resetAt < now) {
    store.set(kunci, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true, cobaLagiDalamDetik: 0 }
  }

  if (entri.count >= MAKS_PER_WINDOW) {
    return {
      ok: false,
      cobaLagiDalamDetik: Math.max(Math.ceil((entri.resetAt - now) / 1000), 1),
    }
  }

  entri.count += 1
  return { ok: true, cobaLagiDalamDetik: 0 }
}
