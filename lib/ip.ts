/**
 * Mengambil IP klien untuk kunci rate limit.
 *
 * Di balik proxy/load balancer, `x-forwarded-for` berisi daftar
 * "client, proxy1, proxy2" — nilai paling KANAN yang ditambahkan proxy
 * terpercaya, jadi itu yang dipakai. Tanpa proxy, `x-real-ip` bila ada.
 * Bila keduanya tidak ada, kembalikan "unknown" (rate limiter tetap jalan
 * per email, lihat app/api/auth/login/route.ts).
 */
export function ambilIpClient(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")

  if (xff) {
    const bagian = xff
      .split(",")
      .map((nilai) => nilai.trim())
      .filter(Boolean)
    if (bagian.length > 0) return bagian[bagian.length - 1]
  }

  const real = req.headers.get("x-real-ip")
  if (real) return real.trim()

  return "unknown"
}
