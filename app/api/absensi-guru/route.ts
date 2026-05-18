import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

// Fungsi helper kuat untuk mengambil dan menyelaraskan data token JWT dari Header
function getAuthPayload(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  
  const tokenString = authHeader.split(" ")[1] // Mengambil string token murni ke-2 setelah spasi
  if (!tokenString) return null

  try {
    // Membaca isi token menggunakan fungsi verifikasi bawaan sistem Anda
    const decoded = verifyToken(tokenString) as any
    
    // Toleransi multi-property: Mendukung id/userId dan role/peran dari JWT payload Anda
    const userId = decoded?.id || decoded?.userId
    const userRole = decoded?.role || decoded?.peran

    if (!userId || !userRole) {
      console.error("Payload JWT kekurangan data identitas:", decoded)
      return null
    }

    return { 
      id: userId, 
      role: userRole.toUpperCase() // Dipaksa menjadi huruf besar (ADMIN / GURU) agar validasi if-else akurat
    }
  } catch (error) {
    console.error("Gagal membedah token JWT di API Absensi Guru:", error)
    return null
  }
}

// 1. GURU ABSEN DATANG (POST)
export async function POST(req: Request) {
  try {
    const payload = getAuthPayload(req)
    if (!payload || !payload.id) {
      return Response.json({ message: "Sesi tidak valid atau token kedaluwarsa" }, { status: 401 })
    }

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
    console.error(error)
    return Response.json({ message: "Gagal mencatat absen guru" }, { status: 500 })
  }
}

// 2. GURU ABSEN PULANG (PUT)
export async function PUT(req: Request) {
  try {
    const payload = getAuthPayload(req)
    if (!payload || !payload.id) {
      return Response.json({ message: "Sesi tidak valid atau token kedaluwarsa" }, { status: 401 })
    }

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
    console.error(error)
    return Response.json({ message: "Gagal mencatat absen pulang" }, { status: 500 })
  }
}

// 3. AMBIL RIWAYAT ABSENSI GURU (GET) - VALIDASI ROBUST UNTUK ADMIN VS GURU
export async function GET(req: Request) {
  try {
    const payload = getAuthPayload(req)
    if (!payload) {
      return Response.json({ message: "Sesi tidak valid atau token kedaluwarsa" }, { status: 401 })
    }

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
    console.error("Gagal memuat rekap data absensi di tingkat database:", error)
    return Response.json({ message: "Gagal mengambil data riwayat" }, { status: 500 })
  }
}
