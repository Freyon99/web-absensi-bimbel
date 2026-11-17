import { responError, responJson } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/hash"
import { signToken } from "@/lib/jwt"
import { bentukUserPublik } from "@/lib/user"
import { responGuard, wajibAdmin } from "@/lib/api-guard"
import { z } from "zod"

const registerSchema = z.object({
  nama: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  peran: z.enum(["ADMIN", "GURU"]),
  noHp: z.string().optional(), // ➕ Tambahkan ini ke skema Zod
})

export async function POST(req: Request) {
  try {
    // =========================
    // KUNCI: HANYA ADMIN yang boleh mendaftarkan akun baru
    // =========================
    await wajibAdmin(req)

    const body = await req.json()
    const data = registerSchema.parse(body)

    const existingUser = await prisma.pengguna.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return responError(400, "Email sudah digunakan")
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
    const safeUser = bentukUserPublik(user)

    return responJson({
      token,
      user: safeUser, // noHp otomatis ikut terbawa di sini
    })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error(error)
    if (error instanceof z.ZodError) {
      return responJson(
        { message: "Format data tidak valid", errors: error.issues },
        { status: 400 },
      )
    }

    return responError(500, "Terjadi kesalahan")
  }
}
