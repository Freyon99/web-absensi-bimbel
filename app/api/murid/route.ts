import prisma from "@/lib/prisma"
import { z } from "zod"
import { jwtVerify } from "jose"
import { Kelas } from "@prisma/client"

const muridSchema = z.object({
  namaLengkap: z.string(),
  namaPanggilan: z.string(),
  kelas: z.nativeEnum(Kelas),
  sekolahAsal: z.string(),
  namaOrangTuaWali: z.string(),
  pekerjaanAyah: z.string().optional(),
  pekerjaanIbu: z.string().optional(),
  alamatDomisili: z.string(),
  noHpOrangTua: z.string(),
  hari: z.string(),
  jam: z.string(),
  pembayaran: z.string(),
  mapel: z.string(),
  catatanAnak: z.string().optional().nullable(),
})

export async function POST(req: Request) {
  try {
    // =========================
    // AMBIL TOKEN LOGIN
    // =========================
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return Response.json(
        { message: "Token tidak ditemukan" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)

    const { payload } = await jwtVerify(token, secret)

    // =========================
    // AMBIL BODY
    // =========================
    const body = await req.json()

    const data = muridSchema.parse(body)

    // =========================
    // SIMPAN KE DATABASE
    // =========================
    const muridBaru = await prisma.murid.create({
      data: {
        namaLengkap: data.namaLengkap,
        namaPanggilan: data.namaPanggilan,
        kelas: data.kelas,
        sekolahAsal: data.sekolahAsal,
        namaOrangTuaWali: data.namaOrangTuaWali,
        pekerjaanAyah: data.pekerjaanAyah || "",
        pekerjaanIbu: data.pekerjaanIbu || "",
        alamatDomisili: data.alamatDomisili,
        noHpOrangTua: data.noHpOrangTua,
        hari: data.hari,
        jam: data.jam,
        pembayaran: data.pembayaran,
        mapel: data.mapel,
        catatanAnak: data.catatanAnak || null,

        // AUTO DARI USER LOGIN
        guruId: payload.id as string,
      },
    })

    return Response.json(
      {
        message: "Murid berhasil ditambahkan",
        data: muridBaru,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("DETAIL ERROR DATABASE:", error)

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
        message: "Gagal menambahkan murid",
        detail: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    )
  }
}
// =========================
// AMBIL SEMUA MURID
// =========================
export async function GET() {
  try {
    const semuaMurid = await prisma.murid.findMany({
      orderBy: {
        tanggalMasuk: "desc",
      },
    })

    return Response.json(semuaMurid)
  } catch (error) {
    console.error("DETAIL ERROR GET MURID:", error)

    return Response.json(
      {
        message: "Gagal mengambil data murid",
      },
      {
        status: 500,
      }
    )
  }
}