import prisma from "@/lib/prisma"
import { z } from "zod"
import { responGuard, wajibAdmin } from "@/lib/api-guard"

// Koreksi absensi murid. Hanya ADMIN yang boleh mengubah catatan yang sudah dibuat guru.
const ubahAbsensiSchema = z.object({
  status: z.enum(["HADIR", "IZIN", "SAKIT", "ALPHA"]),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await wajibAdmin(req)

    const { id } = await params
    const body = await req.json().catch(() => null)

    if (!body) {
      return Response.json({ message: "Body permintaan tidak valid" }, { status: 400 })
    }

    const data = ubahAbsensiSchema.parse(body)

    const absensi = await prisma.absensi.findUnique({
      where: { id },
      include: {
        murid: { select: { id: true, namaLengkap: true, kelas: true } },
        guru: { select: { nama: true } },
      },
    })

    if (!absensi) {
      return Response.json({ message: "Catatan absensi tidak ditemukan" }, { status: 404 })
    }

    const absensiDiperbarui = await prisma.absensi.update({
      where: { id: absensi.id },
      data: { status: data.status },
      include: {
        murid: { select: { id: true, namaLengkap: true, kelas: true } },
        guru: { select: { nama: true } },
      },
    })

    return Response.json({
      message: "Absensi murid berhasil dikoreksi",
      data: absensiDiperbarui,
    })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Format data tidak valid", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("DETAIL ERROR KOREKSI ABSENSI:", error)
    return Response.json({ message: "Gagal mengoreksi absensi" }, { status: 500 })
  }
}
