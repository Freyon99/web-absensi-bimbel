import prisma from "@/lib/prisma"
import { jwtVerify } from "jose"

export async function GET(req: Request) {
  try {
    // =========================
    // KUNCI: HANYA ADMIN yang boleh melihat daftar pengguna
    // =========================
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return Response.json({ message: "Token tidak ditemukan" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)

    let payload: Record<string, unknown>
    try {
      payload = (await jwtVerify(token, secret)).payload as Record<string, unknown>
    } catch {
      return Response.json(
        { message: "Token tidak valid atau kedaluwarsa" },
        { status: 401 }
      )
    }

    const userRole = (payload.peran || payload.role) as string | undefined
    if (userRole !== "ADMIN") {
      return Response.json(
        { message: "Akses ditolak: Hanya ADMIN yang diizinkan" },
        { status: 403 }
      )
    }

    const allUsers = await prisma.pengguna.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        noHp: true, // ➕ WAJIB ditambahkan agar nomor HP ditarik dari database
      },
    })
    return Response.json(allUsers)
  } catch (error) {
    return Response.json({ message: "Gagal memuat data pengguna" }, { status: 500 })
  }
}
