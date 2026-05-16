import prisma from "@/lib/prisma"
import { z } from "zod"

const absensiGuruSchema = z.object({
  guruId: z.string(),
})

// GURU MELAKUKAN ABSEN MASUK
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { guruId } = absensiGuruSchema.parse(body)

    const logAbsen = await prisma.absensiGuru.create({
      data: { guruId },
    })

    return Response.json({ message: "Absen masuk berhasil", data: logAbsen }, { status: 201 })
  } catch (error) {
    return Response.json({ message: "Gagal mencatat absen guru" }, { status: 500 })
  }
}

// AMBIL RIWAYAT ABSENSI GURU
export async function GET(req: Request) {
  try {
    // 1. Ambil query parameter guruId dari URL (jika ada)
    const { searchParams } = new URL(req.url)
    const guruId = searchParams.get("guruId")

    // 2. Siapkan kondisi filter database
    const whereCondition = guruId ? { guruId } : {}

    // 3. Ambil data dari database beserta informasi profil gurunya
    const riwayatAbsen = await prisma.absensiGuru.findMany({
      where: whereCondition,
      include: {
        guru: {
          select: {
            nama: true,
            email: true,
            peran: true,
          },
        },
      },
      orderBy: {
        waktuMasuk: "desc", // Urutkan dari absen yang paling baru
      },
    })

    return Response.json(riwayatAbsen)
  } catch (error) {
    console.error(error)
    return Response.json(
      { message: "Gagal mengambil data riwayat absen guru" },
      { status: 500 }
    )
  }
}
