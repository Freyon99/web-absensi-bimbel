import prisma from "@/lib/prisma"
import { responGuard, wajibAuth } from "@/lib/api-guard"

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
        { status: 400 }
      )
    }

    const logAbsen = await prisma.absensiGuru.create({
      data: { guruId: payload.id },
    })

    return Response.json({ message: "Absen datang berhasil dicatat", data: logAbsen }, { status: 201 })
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
        { message: "Gagal: Anda belum melakukan Absen Datang hari ini, atau Anda sudah melakukan Absen Pulang." },
        { status: 400 }
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

    let whereCondition = {}

    // Jika yang mengakses adalah GURU, maka dia dikunci hanya boleh melihat datanya sendiri
    // Jika yang mengakses ADMIN, objek parameter filter sengaja dibiarkan kosong ({}) agar Prisma menarik total data seluruh pengajar
    if (payload.role === "GURU") {
      whereCondition = { guruId: payload.id }
    }

    const riwayatAbsen = await prisma.absensiGuru.findMany({
      where: whereCondition,
      include: {
        guru: {
          select: { nama: true, email: true, peran: true },
        },
      },
      orderBy: {
        waktuMasuk: "desc",
      },
    })

    return Response.json(riwayatAbsen)
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("Gagal memuat rekap data absensi di tingkat database:", error)
    return Response.json({ message: "Gagal mengambil riwayat" }, { status: 500 })
  }
}
