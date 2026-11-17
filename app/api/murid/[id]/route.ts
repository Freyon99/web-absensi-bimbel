import { responError, responJson } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { Kelas } from "@prisma/client"
import { responGuard, wajibAdmin, wajibAuth } from "@/lib/api-guard"

const updateMuridSchema = z.object({
  namaLengkap: z.string().optional(),
  namaPanggilan: z.string().optional(),
  kelas: z.nativeEnum(Kelas).optional(),
  sekolahAsal: z.string().optional(),
  namaOrangTuaWali: z.string().optional(),
  pekerjaanAyah: z.string().optional(),
  pekerjaanIbu: z.string().optional(),
  alamatDomisili: z.string().optional(),
  noHpOrangTua: z.string().optional(),
  hari: z.string().optional(),
  jam: z.string().optional(),
  pembayaran: z.string().optional(),
  mapel: z.string().optional(),
  catatanAnak: z.string().optional().nullable(),
})

// GET DETAIL MURID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await wajibAuth(req)

    const { id } = await params

    const murid = await prisma.murid.findUnique({
      where: { id },
    })

    if (!murid) {
      return responError(404, "Murid tidak ditemukan")
    }

    return responJson(murid)
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    return responError(500, "Gagal mengambil data murid")
  }
}

// UPDATE MURID
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await wajibAdmin(req)

    const { id } = await params
    const body = await req.json()
    const data = updateMuridSchema.parse(body)
    const murid = await prisma.murid.update({
      where: { id },
      data,
    })
    return responJson({
      message: "Data murid berhasil diperbarui",
      data: murid,
    })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("PUT ERROR:", error)

    if (error instanceof z.ZodError) {
      return responJson(
        {
          message: "Format data tidak valid",
          errors: error.issues,
        },
        { status: 400 },
      )
    }

    return responJson(
      {
        message: error instanceof Error ? error.message : "Gagal update murid",
      },
      { status: 500 },
    )
  }
}

// HAPUS MURID
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await wajibAdmin(req)

    const { id } = await params

    await prisma.murid.delete({
      where: { id },
    })

    return responJson({
      message: "Murid berhasil dihapus",
    })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("DELETE MURID ERROR:", error)
    return responError(500, "Gagal menghapus murid")
  }
}
