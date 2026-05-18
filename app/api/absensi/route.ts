import prisma from "@/lib/prisma"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { headers } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET!

// UPDATE: Hapus guruId dari skema Zod karena frontend tidak boleh mengirimkannya lagi
const absensiSchema = z.object({
  muridId: z.string().uuid("Format muridId harus UUID"),
  status: z.enum(["HADIR", "IZIN", "SAKIT", "ALPHA"]),
})

// 1. ENDPOINT: MENCATAT ABSENSI MURID (POST)
export async function POST(req: Request) {
  try {
    // A. Ambil token dari header untuk verifikasi identitas guru secara aman
    const headersList = await headers()
    const authorization = headersList.get("authorization")

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return Response.json({ message: "Sesi tidak valid atau token tidak ditemukan" }, { status: 401 })
    }

    const token = authorization.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string }

    if (!decoded || !decoded.id) {
      return Response.json({ message: "Token tidak valid" }, { status: 401 })
    }

    // B. Ambil bodi request dan validasi menggunakan Zod (hanya muridId & status)
    const body = await req.json()
    const data = absensiSchema.parse(body)

    // C. Simpan ke database PostgreSQL, gunakan decoded.id dari token sebagai guruId
    const absensiBaru = await prisma.absensi.create({
      data: {
        muridId: data.muridId,
        guruId: decoded.id, // ID Guru didapat dengan aman dari token JWT internal backend
        status: data.status,
      },
    })

    return Response.json(
      { message: "Absensi murid berhasil dicatat", data: absensiBaru }, 
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Format data tidak valid", errors: error.issues }, 
        { status: 400 }
      )
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return Response.json({ message: "Sesi Anda telah berakhir, silakan login kembali" }, { status: 401 })
    }

    console.error("DETAIL ERROR ABSENSI:", error)
    return Response.json(
      { message: "Gagal mencatat absensi" }, 
      { status: 500 }
    )
  }
}

// 2. ENDPOINT: LIHAT SEMUA RIWAYAT ABSENSI MURID (GET)
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
        tanggal: "desc",
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
