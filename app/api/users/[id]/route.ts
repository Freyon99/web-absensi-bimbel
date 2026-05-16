import prisma from "@/lib/prisma"
import { z } from "zod"
import { hashPassword } from "@/lib/hash"
import { jwtVerify } from "jose"

const updateUserSchema = z.object({
  nama: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  peran: z.enum(["ADMIN", "GURU"]).optional(),
})

// Fungsi pembantu mengecekan Admin yang aman
async function isAdmin(req: Request) {
  const authHeader = req.headers.get("authorization")
  const tokenString = authHeader?.split(" ")[1] // Mengambil string token murni
  
  if (!tokenString) return false
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(tokenString, secret)
    const userRole = payload.peran || payload.role // Mendukung properti peran atau role
    return userRole === "ADMIN"
  } catch {
    return false
  }
}

// 1. UPDATE DATA GURU/USER (HANYA ADMIN)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    if (!(await isAdmin(req))) {
      return Response.json({ message: "Akses ditolak: Hanya ADMIN yang diizinkan" }, { status: 403 })
    }

    const body = await req.json()
    const data = updateUserSchema.parse(body)

    if (data.password) {
      data.password = await hashPassword(data.password)
    }

    const userDiperbarui = await prisma.pengguna.update({
      where: { id },
      data,
      select: { id: true, nama: true, email: true, peran: true },
    })

    return Response.json({ message: "Data pengguna berhasil diperbarui", data: userDiperbarui })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Format data tidak valid", errors: error.issues }, { status: 400 })
    }
    return Response.json({ message: "Gagal memperbarui pengguna", detail: error instanceof Error ? error.message : error }, { status: 500 })
  }
}

// 2. HAPUS DATA GURU/USER (HANYA ADMIN)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!(await isAdmin(req))) {
      return Response.json({ message: "Akses ditolak: Hanya ADMIN yang diizinkan" }, { status: 403 })
    }

    await prisma.pengguna.delete({
      where: { id },
    })

    return Response.json({ message: "Akun pengguna berhasil dihapus" })
  } catch (error) {
    return Response.json({ message: "Gagal menghapus pengguna", detail: error instanceof Error ? error.message : error }, { status: 500 })
  }
}
