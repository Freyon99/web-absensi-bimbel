import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/hash"
import { signToken } from "@/lib/jwt"
import { jwtVerify } from "jose"
import { z } from "zod"

const registerSchema = z.object({
  nama: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  peran: z.enum(["ADMIN", "GURU"]),
  noHp: z.string().optional(), // ➕ Tambahkan ini ke skema Zod
})

export async function POST(req: Request) {
  try {
    // =========================
    // KUNCI: HANYA ADMIN yang boleh mendaftarkan akun baru
    // =========================
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return Response.json({ message: "Token tidak ditemukan" }, { status: 401 })
    }

    const tokenPetugas = authHeader.split(" ")[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)

    let payload: Record<string, unknown>
    try {
      payload = (await jwtVerify(tokenPetugas, secret)).payload as Record<string, unknown>
    } catch {
      return Response.json(
        { message: "Token tidak valid atau kedaluwarsa" },
        { status: 401 }
      )
    }

    const peranPetugas = (payload.peran || payload.role) as string | undefined
    if (peranPetugas !== "ADMIN") {
      return Response.json(
        { message: "Akses ditolak: Hanya ADMIN yang diizinkan" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = registerSchema.parse(body)

    const existingUser = await prisma.pengguna.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return Response.json({ message: "Email sudah digunakan" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.pengguna.create({
      data: {
        nama: data.nama,
        email: data.email,
        password: hashedPassword,
        peran: data.peran,
        noHp: data.noHp, // ➕ Daftarkan input noHp ke database Prisma
      },
    })

    const token = signToken({
      id: user.id,
      role: user.peran,
    })

    // Sembunyikan field id dan password dari frontend
    const { password, id, ...safeUser } = user
    
    return Response.json({
      token,
      user: safeUser, // noHp otomatis ikut terbawa di sini
    })

  } catch (error) {
    console.log(error)
    return Response.json({ message: "Terjadi kesalahan" }, { status: 500 })
  }
}
