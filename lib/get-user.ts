import { cookies, headers } from "next/headers"
import jwt from "jsonwebtoken"
import prisma from "@/lib/prisma" // 1. Tambahkan import prisma di sini

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  id: string
  role: "ADMIN" | "GURU"
}

export async function getUserFromHeader() {
  const headersList = await headers()

  const authorization = headersList.get("authorization")
  const token =
    authorization?.split(" ")[1] ?? (await cookies()).get("token")?.value

  if (!token) {
    throw new Error("Unauthorized")
  }

  const decoded = jwt.verify(
    token,
    JWT_SECRET
  ) as JwtPayload

  // 2. Cari data lengkap user ke database berdasarkan id dari token
  const user = await prisma.pengguna.findUnique({
    where: {
      id: decoded.id,
    },
  })

  if (!user) {
    throw new Error("User tidak ditemukan")
  }

  // 3. Keluarkan password dan id agar tidak ikut dikirim ke frontend
  const { password, id, ...safeUser } = user

  // 4. Kembalikan data user yang sudah aman (nama, email, peran, dll)
  return safeUser
}
