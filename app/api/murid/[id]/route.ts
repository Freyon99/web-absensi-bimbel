import prisma from "@/lib/prisma"
import { z } from "zod"
import { jwtVerify } from "jose"

const updateMuridSchema = z.object({
  namaLengkap: z.string().optional(),
  namaPanggilan: z.string().optional(),
  kelas: z.string().optional(),
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

// 1. UPDATE DATA MURID (Bisa diakses ADMIN & GURU)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params 
    
    const body = await req.json()
    const data = updateMuridSchema.parse(body)

    const muridDiperbarui = await prisma.murid.update({
      where: { id },
      data,
    })

    return Response.json({ message: "Data murid berhasil diperbarui", data: muridDiperbarui })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: "Format data tidak valid", errors: error.issues }, { status: 400 })
    }
    return Response.json({ message: "Gagal memperbarui data murid", detail: error instanceof Error ? error.message : error }, { status: 500 })
  }
}

// 2. HAPUS DATA MURID (HANYA BOLEH ADMIN)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const authHeader = req.headers.get("authorization")
    const token = authHeader?.split(" ")

    if (token && token[1]) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token[1], secret)

      if (payload.peran !== "ADMIN" && payload.role !== "ADMIN") {
        return Response.json(
          { message: "Akses ditolak: Hanya ADMIN yang bisa menghapus murid" }, 
          { status: 403 }
        )
      }
    } else {
      return Response.json(
        { message: "Autentikasi gagal: Token tidak ditemukan" }, 
        { status: 401 }
      )
    }

    await prisma.murid.delete({
      where: { id },
    })

    return Response.json({ message: "Murid berhasil dihapus dari sistem" })
  } catch (error) {
    return Response.json({ message: "Gagal menghapus murid", detail: error instanceof Error ? error.message : error }, { status: 500 })
  }
}
