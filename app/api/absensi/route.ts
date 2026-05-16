import prisma from "@/lib/prisma"
import { z } from "zod"

// Validasi bodi request sesuai enum di Prisma schema
const absensiSchema = z.object({
  muridId: z.string().uuid("Format muridId harus UUID"),
  guruId: z.string().uuid("Format guruId harus UUID"),
  status: z.enum(["HADIR", "IZIN", "SAKIT", "ALPHA"]),
})

// 1. ENDPOINT: MENCATAT ABSENSI MURID
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validasi data input menggunakan Zod
    const data = absensiSchema.parse(body)

    // Simpan ke database PostgreSQL melalui Prisma
    const absensiBaru = await prisma.absensi.create({
      data: {
        muridId: data.muridId,
        guruId: data.guruId,
        status: data.status,
      },
    })

    return Response.json(
      { message: "Absensi murid berhasil dicatat", data: absensiBaru }, 
      { status: 201 }
    )

  } catch (error) {
    // Tangani jika format JSON dari Postman tidak sesuai skema Zod
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Format data tidak valid", errors: error.issues }, 
        { status: 400 }
      )
    }

    console.error("DETAIL ERROR ABSENSI:", error)

    return Response.json(
      { message: "Gagal mencatat absensi", detail: error instanceof Error ? error.message : error }, 
      { status: 500 }
    )
  }
}

// 2. ENDPOINT: LIHAT SEMUA RIWAYAT ABSENSI MURID (REKAP)
export async function GET() {
  try {
    const riwayatAbsensi = await prisma.absensi.findMany({
      include: {
        murid: {
          select: {
            namaLengkap: true,
            kelas: true,
          }
        },
        guru: {
          select: {
            nama: true,
            peran: true,
          }
        }
      },
      orderBy: {
        tanggal: "desc", // Tampilkan dari absen yang paling baru
      }
    })

    return Response.json(riwayatAbsensi)

  } catch (error) {
    console.error("DETAIL ERROR GET ABSENSI:", error)
    return Response.json(
      { message: "Gagal mengambil data riwayat absensi" }, 
      { status: 500 }
    )
  }
}
