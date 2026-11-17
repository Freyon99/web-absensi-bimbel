import  prisma  from "@/lib/prisma"
import { comparePassword } from "@/lib/hash"
import { signToken } from "@/lib/jwt"
import { cekRateLimiter } from "@/lib/rate-limit"
import { setCookieToken } from "@/lib/api-guard"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const data = loginSchema.parse(body)

    // Pembatas percobaan login per email + IP untuk mencegah brute-force.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const rate = cekRateLimiter(`login:${ip}:${data.email.toLowerCase()}`)
    if (!rate.ok) {
      return Response.json(
        { message: "Terlalu banyak percobaan login. Silakan coba lagi nanti." },
        { status: 429, headers: { "Retry-After": String(rate.cobaLagiDalamDetik) } }
      )
    }

    const user = await prisma.pengguna.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      return Response.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      )
    }

    const isValidPassword = await comparePassword(
      data.password,
      user.password
    )

    if (!isValidPassword) {
      return Response.json(
        {
          message: "Password salah",
        },
        {
          status: 401,
        }
      )
    }

    const token = signToken({
      id: user.id,
      role: user.peran,
    })

    const { id, password, ...safeUser } = user

    const res = Response.json({ token, user: safeUser })
    // Sesi disimpan sebagai cookie HttpOnly supaya tidak bisa dibaca JavaScript.
    setCookieToken(req, res, token)
    return res
    
  } catch (error) {
    console.error("DETAIL ERROR LOGIN:", error)

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Format data tidak valid", errors: error.issues },
        { status: 400 }
      )
    }

    return Response.json({ message: "Terjadi kesalahan" }, { status: 500 })
  }
}