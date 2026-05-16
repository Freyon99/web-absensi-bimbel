import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // 1. Ambil token dari Header Authorization (Format: Bearer <token>)
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) {
    return NextResponse.json(
      { message: "Autentikasi gagal: Token tidak ditemukan" },
      { status: 401 }
    )
  }

  try {
    // 2. Verifikasi Token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // Simpan data peran (role) dari token payload
    const userRole = payload.peran as string

    // 3. PROTEKSI ROLE: Hanya ADMIN yang boleh mendaftarkan murid baru
    if (path.startsWith("/api/murid") && req.method === "POST") {
      if (userRole !== "ADMIN") {
        return NextResponse.json(
          { message: "Akses ditolak: Hanya ADMIN yang boleh menambah murid" },
          { status: 403 }
        )
      }
    }

    // Jika token valid dan role sesuai, izinkan request berlanjut ke endpoint API asli
    return NextResponse.next()

  } catch (error) {
    return NextResponse.json(
      { message: "Autentikasi gagal: Token tidak valid atau kedaluwarsa" },
      { status: 401 }
    )
  }
}

// 4. Atur rute mana saja yang wajib melewati proteksi middleware ini
export const config = {
  matcher: [
    "/api/murid/:path*",
    "/api/absensi/:path*",
    "/api/absensi-guru/:path*",
  ],
}
