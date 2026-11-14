import prisma from "@/lib/prisma"
import { z } from "zod"
import { Kelas } from "@prisma/client"
import { jwtVerify } from "jose"

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

async function verifyToken(req: Request) {
  const authHeader = req.headers.get("authorization")

  const token = authHeader?.split(" ")[1]

  if (!token) {
    throw new Error("TOKEN_NOT_FOUND")
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)

  const { payload } = await jwtVerify(token, secret)

  return payload
}

// GET DETAIL MURID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyToken(req)

    const { id } = await params

    const murid = await prisma.murid.findUnique({
      where: { id },
    })

    if (!murid) {
      return Response.json(
        { message: "Murid tidak ditemukan" },
        { status: 404 }
      )
    }

    return Response.json(murid)
  } catch (error) {
    return Response.json(
      { message: "Gagal mengambil data murid" },
      { status: 500 }
    )
  }
}

// UPDATE MURID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyToken(req)
    if ((payload.peran || payload.role) !== "ADMIN") {
      return Response.json(
        { message: "Akses ditolak: Hanya ADMIN yang diizinkan" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const data = updateMuridSchema.parse(body)
    const murid = await prisma.murid.update({
      where: { id },
      data,
    })
    return Response.json({
      message: "Data murid berhasil diperbarui",
      data: murid,
    })
  } catch (error) {
    console.error("PUT ERROR:", error)

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Format data tidak valid",
          errors: error.issues,
        },
        { status: 400 }
      )
    }

    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Gagal update murid",
      },
      { status: 500 }
    )
  }
}

// HAPUS MURID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyToken(req)
    if ((payload.peran || payload.role) !== "ADMIN") {
      return Response.json(
        { message: "Akses ditolak: Hanya ADMIN yang diizinkan" },
        { status: 403 }
      )
    }

    const { id } = await params

    await prisma.murid.delete({
      where: { id },
    })

    return Response.json({
      message: "Murid berhasil dihapus",
    })
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus murid",
      },
      { status: 500 }
    )
  }
}