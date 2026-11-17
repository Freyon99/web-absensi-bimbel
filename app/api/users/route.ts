import prisma from "@/lib/prisma"
import { responGuard, wajibAdmin } from "@/lib/api-guard"

export async function GET(req: Request) {
  try {
    // =========================
    // KUNCI: HANYA ADMIN yang boleh melihat daftar pengguna
    // =========================
    await wajibAdmin(req)

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
    const guard = responGuard(error)
    if (guard) return guard

    return Response.json({ message: "Gagal memuat data pengguna" }, { status: 500 })
  }
}
