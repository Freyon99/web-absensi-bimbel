import { getUserFromHeader } from "@/lib/get-user"
import { signToken } from "@/lib/jwt"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { headers } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET!

export async function GET() {
  try {
    // 1. Ambil token lama dari header untuk mendapatkan ID asli
    const headersList = await headers()
    const authorization = headersList.get("authorization")
    const tokenLama = authorization?.split(" ")[1]

    if (!tokenLama) throw new Error("Unauthorized")
    const decoded = jwt.verify(tokenLama, JWT_SECRET) as { id: string; role: "ADMIN" | "GURU" }

    // 2. Ambil data pengajar terbaru dari DB via helper yang sudah kita perbaiki
    const safeUser = await getUserFromHeader()

    // 3. Buat token baru (Refresh Token) agar sesi user diperpanjang otomatis
    const tokenBaru = signToken({ id: decoded.id, role: decoded.role })

    // 4. Return dengan format seragam sesuai struktur Vinsen
    return Response.json({ token: tokenBaru, user: safeUser })
    } catch (error) {
    return Response.json({ message: "Unauthorized" }, { status: 401 })
  }
}
