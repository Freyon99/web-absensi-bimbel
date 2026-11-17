import { jwtVerify } from "jose"

export interface AuthPayload {
  id: string
  role: string // "ADMIN" | "GURU"
}

export class AutentikasiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "AutentikasiError"
    this.status = status
  }
}

/**
 * Satu penjaga seragam untuk semua route API.
 * Token diambil dari header `Authorization: Bearer <token>` dan diverifikasi
 * dengan JWT_SECRET. Melempar AutentikasiError bila gagal.
 */
export async function wajibAuth(req: Request): Promise<AuthPayload> {
  const token = ambilToken(req)

  if (!token) {
    throw new AutentikasiError("Token tidak ditemukan", 401)
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)

  let payload: Record<string, unknown>
  try {
    payload = (await jwtVerify(token, secret)).payload as Record<string, unknown>
  } catch {
    throw new AutentikasiError("Token tidak valid atau kedaluwarsa", 401)
  }

  const id = (payload.id || payload.userId) as string | undefined
  const role = ((payload.peran || payload.role) as string | undefined)?.toUpperCase()

  if (!id || !role) {
    throw new AutentikasiError("Token tidak valid", 401)
  }

  // Penjaga CSRF: browser modern mengirim `Sec-Fetch-Site`. Request lintas situs
  // ke endpoint yang mengubah data ditolak. Cookie SameSite=Strict tetap lapisan
  // utama; ini menutup kasus browser/proxy yang tidak mengirimkan header itu.
  const method = req.method.toUpperCase();
  const mengubahData = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  if (mengubahData && req.headers.get("sec-fetch-site") === "cross-site") {
    throw new AutentikasiError("Akses ditolak: request lintas situs", 403);
  }

  return { id, role }
}

/** Seperti wajibAuth, tapi hanya untuk ADMIN. */
export async function wajibAdmin(req: Request): Promise<AuthPayload> {
  const payload = await wajibAuth(req)

  if (payload.role !== "ADMIN") {
    throw new AutentikasiError("Akses ditolak: Hanya ADMIN yang diizinkan", 403)
  }

  return payload
}

/**
 * Pakai di blok catch route: mengubah AutentikasiError menjadi Response.
 * Return null bila error bukan berasal dari penjaga.
 */
export function responGuard(error: unknown): Response | null {
  if (error instanceof AutentikasiError) {
    return Response.json({ message: error.message }, { status: error.status })
  }
  return null
}

export const NAMA_COOKIE_TOKEN = "token"
export const MAX_AGE_TOKEN = 8 * 60 * 60 // 8 jam, sejalan dengan masa berlaku JWT

function ambilTokenDariCookie(req: Request): string | null {
  const mentah = req.headers.get("cookie")
  if (!mentah) return null

  for (const bagian of mentah.split(";")) {
    const pasangan = bagian.trim().split("=")
    if (pasangan[0] === NAMA_COOKIE_TOKEN) {
      const nilai = pasangan.slice(1).join("=")
      return nilai ? decodeURIComponent(nilai) : null
    }
  }

  return null
}

/**
 * Token diambil dari header Authorization (Bearer) atau cookie HttpOnly.
 * Cookie dipakai aplikasi; header dipertahankan agar pengujian API masih bisa jalan.
 */
export function ambilToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization")
  const dariHeader = authHeader?.split(" ")[1]
  if (dariHeader) return dariHeader
  return ambilTokenDariCookie(req)
}

export function opsiCookie(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
  const secure = proto === "https" || new URL(req.url).protocol === "https:"
  return secure ? "; Secure" : ""
}

/** Menempelkan cookie sesi HttpOnly pada response. */
export function setCookieToken(req: Request, res: Response, token: string) {
  res.headers.append(
    "Set-Cookie",
    `${NAMA_COOKIE_TOKEN}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_AGE_TOKEN}${opsiCookie(req)}`
  )
}

/** Nilai header Set-Cookie untuk menghapus cookie sesi. */
export function headerHapusCookieToken(req: Request): string {
  return `${NAMA_COOKIE_TOKEN}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${opsiCookie(req)}`
}
