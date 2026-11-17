import prisma from "@/lib/prisma"
import { z } from "zod"
import { hashPassword } from "@/lib/hash"
import { responGuard, wajibAdmin } from "@/lib/api-guard"

const updateUserSchema = z.object({
  nama: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
  peran: z.enum(["ADMIN", "GURU"]).optional(),
  noHp: z.string().min(11).optional(),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await wajibAdmin(req)

    const body = await req.json()
    const data = updateUserSchema.parse(body)

    if (data.password && data.password.trim() !== "") {
      data.password = await hashPassword(data.password)
    } else {
      delete data.password
    }

    const userDiperbarui = await prisma.pengguna.update({
      where: { id },
      data,
      select: { 
        nama: true, 
        email: true, 
        peran: true,
        noHp: true // ➕ Izinkan noHp terpilih agar muncul setelah diupdate
      },
    })

    return Response.json({ message: "Data pengguna berhasil diperbarui", data: userDiperbarui })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    if (error instanceof z.ZodError) {
      return Response.json({ message: "Format data tidak valid", errors: error.issues }, { status: 400 })
    }
    return Response.json({ message: "Gagal memperbarui pengguna" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await wajibAdmin(req)

    await prisma.pengguna.delete({
      where: { id },
    })

    return Response.json({ message: "Akun pengguna berhasil dihapus" })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    return Response.json({ message: "Gagal menghapus pengguna" }, { status: 500 })
  }
}
