import { clearSession } from "@/lib/session"

/**
 * Pembungkus fetch untuk API same-origin.
 * Cookie sesi HttpOnly dikirim otomatis browser, jadi tidak perlu header
 * Authorization. Kalau server membalas 401, sesi dibersihkan dan pengguna
 * dikembalikan ke halaman login.
 */
export async function fetchApi(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { ...init })

  if (res.status === 401) {
    clearSession()
    if (typeof window !== "undefined") {
      window.location.assign("/")
    }
  }

  return res
}
