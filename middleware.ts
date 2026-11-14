import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // 1. Ambil token dari Cookies halaman web atau Header API
  const tokenFromHeader = req.headers.get("authorization")?.split(" ")[1]
  const tokenFromCookie = req.cookies.get("token")?.value
  const token = tokenFromCookie || tokenFromHeader

  // --- 2. KUNCI HALAMAN LOGIN UTAMA (/) ---
  // Jika user mencoba mengetik "/" padahal token cookie-nya masih aktif, BLOKIR dan REDIRECT!
  if (path === "/") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        const userRole = (payload.peran || payload.role) as string

        if (userRole === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url))
        } else {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      } catch (error) {
        // Jika token ternyata rusak/palsu, hapus cookie dan biarkan masuk halaman login
        const response = NextResponse.next()
        response.cookies.delete("token")
        return response
      }
    }
  }

  // --- 3. PROTEKSI HALAMAN VISUAL WEB (/dashboard dan /admin) ---
  if (path.startsWith("/dashboard") || path.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const userRole = (payload.peran || payload.role) as string

      // Batasi hak akses silang halaman
      if (path.startsWith("/dashboard") && userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      if (path.startsWith("/admin") && userRole === "GURU") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      return NextResponse.next()
    } catch {
      // Jika token kedaluwarsa atau salah, tendang ke login halaman awal
      const response = NextResponse.redirect(new URL("/", req.url))
      response.cookies.delete("token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/", // Ikut sertakan rute dasar "/" agar terkunci mutlak
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/murid/:path*",
    "/api/absences/:path*",
  ],
}
