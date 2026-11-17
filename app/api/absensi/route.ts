import prisma from "@/lib/prisma"
import { z } from "zod"
import { responGuard, wajibAuth } from "@/lib/api-guard"

// UPDATE: Hapus guruId dari skema Zod karena frontend tidak boleh mengirimkannya lagi
const absensiSchema = z.object({
  muridId: z.string().uuid("Format muridId harus UUID"),
  status: z.enum(["HADIR", "IZIN", "SAKIT", "ALPHA"]),
})

// 1. ENDPOINT: MENCATAT ABSENSI MURID (POST)
export async function POST(req: Request) {
  try {
    // A. Token diverifikasi di backend, ID guru diambil dari token (bukan dari body)
    const payload = await wajibAuth(req)

    // B. Ambil bodi request dan validasi menggunakan Zod (hanya muridId & status)
    const body = await req.json()
    const data = absensiSchema.parse(body)

    // C. Simpan ke database PostgreSQL
    const absensiBaru = await prisma.absensi.create({
      data: {
        muridId: data.muridId,
        guruId: payload.id, // ID Guru didapat dengan aman dari token JWT internal backend
        status: data.status,
      },
    })

    return Response.json(
      { message: "Absensi murid berhasil dicatat", data: absensiBaru },
      { status: 201 }
    )
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Format data tidak valid", errors: error.issues },
        { status: 400 }
      )
    }

    console.error("DETAIL ERROR ABSENSI:", error)
    return Response.json({ message: "Gagal mencatat absensi" }, { status: 500 })
  }
}

// 2. ENDPOINT: LIHAT SEMUA RIWAYAT ABSENSI MURID (GET)
export async function GET(req: Request) {
  try {
    // WAJIB LOGIN: riwayat absensi berisi nama murid & guru
    await wajibAuth(req)

    const riwayatAbsensi = await prisma.absensi.findMany({
      include: {
        murid: {
          select: {
            namaLengkap: true,
            kelas: true,
          },
        },
        guru: {
          select: {
            nama: true,
            peran: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    })

    return Response.json(riwayatAbsensi)
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("DETAIL ERROR GET ABSENSI:", error)
    return Response.json(
      { message: "Gagal mengambil data riwayat absensi" },
      { status: 500 }
    )
  }
}
