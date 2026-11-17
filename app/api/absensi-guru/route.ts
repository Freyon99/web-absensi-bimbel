import prisma from "@/lib/prisma"
import { responGuard, wajibAuth } from "@/lib/api-guard"
import { Prisma } from "@prisma/client"
import { mulaiHari, akhirHari, dariISOHari } from "@/lib/tanggal"

// 1. GURU ABSEN DATANG (POST)
export async function POST(req: Request) {
  try {
    const payload = await wajibAuth(req)

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    // CEK APAKAH GURU SUDAH ABSEN DATANG HARI INI
    const sudahAbsenHariIni = await prisma.absensiGuru.findFirst({
      where: {
        guruId: payload.id,
        waktuMasuk: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    if (sudahAbsenHariIni) {
      return Response.json(
        { message: "Anda sudah melakukan Absen Datang hari ini. Batas absensi adalah 1x sehari." },
        { status: 400 },
      )
    }

    const logAbsen = await prisma.absensiGuru.create({
      data: { guruId: payload.id },
    })

    return Response.json(
      { message: "Absen datang berhasil dicatat", data: logAbsen },
      { status: 201 },
    )
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error(error)
    return Response.json({ message: "Gagal mencatat absen guru" }, { status: 500 })
  }
}

// 2. GURU ABSEN PULANG (PUT)
export async function PUT(req: Request) {
  try {
    const payload = await wajibAuth(req)

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const absenHariIni = await prisma.absensiGuru.findFirst({
      where: {
        guruId: payload.id,
        waktuMasuk: {
          gte: startOfDay,
          lte: endOfDay,
        },
        waktuPulang: null,
      },
      orderBy: {
        waktuMasuk: "desc",
      },
    })

    if (!absenHariIni) {
      return Response.json(
        {
          message:
            "Gagal: Anda belum melakukan Absen Datang hari ini, atau Anda sudah melakukan Absen Pulang.",
        },
        { status: 400 },
      )
    }

    const absenDiperbarui = await prisma.absensiGuru.update({
      where: { id: absenHariIni.id },
      data: {
        waktuPulang: new Date(),
      },
    })

    return Response.json({ message: "Absen pulang berhasil dicatat", data: absenDiperbarui })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error(error)
    return Response.json({ message: "Gagal mencatat absen pulang" }, { status: 500 })
  }
}

// 3. AMBIL RIWAYAT ABSENSI GURU (GET) - VALIDASI ROBUST UNTUK ADMIN VS GURU
export async function GET(req: Request) {
  try {
    const payload = await wajibAuth(req)

    const AND: Prisma.AbsensiGuruWhereInput[] = []

    // Jika yang mengakses adalah GURU, maka dia dikunci hanya boleh melihat datanya sendiri
    // Jika yang mengakses ADMIN, filter sengaja dibiarkan kosong agar Prisma menarik data seluruh pengajar
    if (payload.role === "GURU") {
      AND.push({ guruId: payload.id })
    }

    const params = new URL(req.url).searchParams

    // Rentang tanggal opsional (YYYY-MM-DD, batas hari server-local).
    const tanggalMulai = params.get("tanggalMulai")
    if (tanggalMulai && /^\d{4}-\d{2}-\d{2}$/.test(tanggalMulai)) {
      AND.push({ waktuMasuk: { gte: mulaiHari(dariISOHari(tanggalMulai)) } })
    }

    const tanggalSelesai = params.get("tanggalSelesai")
    if (tanggalSelesai && /^\d{4}-\d{2}-\d{2}$/.test(tanggalSelesai)) {
      AND.push({ waktuMasuk: { lte: akhirHari(dariISOHari(tanggalSelesai)) } })
    }

    const batas = Math.min(Math.max(Number(params.get("batas")) || 500, 1), 1000)
    const where = AND.length > 0 ? { AND } : undefined

    const [riwayatAbsen, total] = await Promise.all([
      prisma.absensiGuru.findMany({
        where,
        include: {
          guru: {
            select: { nama: true, email: true, peran: true },
          },
        },
        orderBy: {
          waktuMasuk: "desc",
        },
        take: batas,
      }),
      prisma.absensiGuru.count({ where }),
    ])

    // `total` memungkinkan klien menampilkan hitungan sebenarnya walau data
    // yang dikirim dibatasi.
    return Response.json({ data: riwayatAbsen, total })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("Gagal memuat rekap data absensi di tingkat database:", error)
    return Response.json({ message: "Gagal mengambil riwayat" }, { status: 500 })
  }
}
