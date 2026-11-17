import { headerHapusCookieToken } from "@/lib/api-guard"

// =========================
// LOGOUT: hapus cookie sesi HttpOnly di server
// =========================
export async function POST(req: Request) {
  const res = Response.json({ message: "Berhasil keluar" })
  res.headers.append("Set-Cookie", headerHapusCookieToken(req))
  return res
}
