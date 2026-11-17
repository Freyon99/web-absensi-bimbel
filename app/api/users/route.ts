import { responError, responJson } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { responGuard, wajibAdmin } from "@/lib/api-guard"

export async function GET(req: Request) {
  try {
    await wajibAdmin(req)

    const allUsers = await prisma.pengguna.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
      },
    })
    return responJson(allUsers)
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    return responError(500, "Gagal memuat data pengguna")
  }
}
