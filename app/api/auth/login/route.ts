import prisma from "@/lib/prisma"
import { comparePassword } from "@/lib/hash"
import { signToken } from "@/lib/jwt"
import { cekRateLimiter } from "@/lib/rate-limit"
import { setCookieToken } from "@/lib/api-guard"
import { bentukUserPublik } from "@/lib/user"
import { ambilIpClient } from "@/lib/ip"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const data = loginSchema.parse(body)

    // Pembatas percobaan login. Dua lapis: per email (tidak bisa dilewati
    // dengan memalsukan IP) dan per email+IP.
    const ip = ambilIpClient(req)
    const emailKecil = data.email.toLowerCase()

    const batasEmail = cekRateLimiter(`login-email:${emailKecil}`)
    if (!batasEmail.ok) {
      return Response.json(
        { message: "Terlalu banyak percobaan login. Silakan coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(batasEmail.cobaLagiDalamDetik) } },
      )
    }

    const batasIp = cekRateLimiter(`login-ip:${ip}:${emailKecil}`)
    if (!batasIp.ok) {
      return Response.json(
        { message: "Terlalu banyak percobaan login. Silakan coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(batasIp.cobaLagiDalamDetik) } },
      )
    }

    const user = await prisma.pengguna.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      // Jangan bedakan "email tidak terdaftar" dan "password salah" supaya
      // penyerang tidak bisa menebak akun yang valid.
      return Response.json(
        {
          message: "Email atau password salah",
        },
        {
          status: 401,
        },
      )
    }

    const isValidPassword = await comparePassword(data.password, user.password)

    if (!isValidPassword) {
      return Response.json(
        {
          message: "Email atau password salah",
        },
        {
          status: 401,
        },
      )
    }

    const token = signToken({
      id: user.id,
      role: user.peran,
    })

    const safeUser = bentukUserPublik(user)

    const res = Response.json({ token, user: safeUser })
    // Sesi disimpan sebagai cookie HttpOnly supaya tidak bisa dibaca JavaScript.
    setCookieToken(req, res, token)
    return res
  } catch (error) {
    console.error("DETAIL ERROR LOGIN:", error)

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Format data tidak valid", errors: error.issues },
        { status: 400 },
      )
    }

    return Response.json({ message: "Terjadi kesalahan" }, { status: 500 })
  }
}
