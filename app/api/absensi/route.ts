import prisma from "@/lib/prisma"
import { z } from "zod"
import { responGuard, wajibAuth } from "@/lib/api-guard"
import { Kelas, Prisma } from "@prisma/client"
import { KELAS_OPTIONS } from "@/lib/kelas"
import { mulaiHari, akhirHari, dariISOHari } from "@/lib/tanggal"

// UPDATE: Hapus guruId dari skema Zod karena frontend tidak boleh mengirimkannya lagi
const absensiSchema = z.object({
  muridId: z.string().uuid("Format muridId harus UUID"),
  status: z.enum(["HADIR", "IZIN", "SAKIT", "ALPHA"]),
})

// 1. ENDPOINT: MENCATAT ABSENSI MURID (POST)
export async function POST(req: Request) {
  try {
    // A. Token diverifikasi di backend, ID pencatat diambil dari token (bukan dari body).
    // Absensi murid dipakai di halaman Admin maupun dashboard Guru, jadi cukup login.
    const payload = await wajibAuth(req)

    // B. Ambil bodi request dan validasi menggunakan Zod (hanya muridId & status)
    const body = await req.json().catch(() => null)
    if (!body) {
      return Response.json({ message: "Body permintaan tidak valid" }, { status: 400 })
    }

    const data = absensiSchema.parse(body)

    // MuridId asing sebelumnya berakhir sebagai 500 (pelanggaran foreign key).
    // Dicek dulu supaya responsnya 404 yang jelas.
    const murid = await prisma.murid.findUnique({
      where: { id: data.muridId },
      select: { id: true },
    })

    if (!murid) {
      return Response.json({ message: "Murid tidak ditemukan" }, { status: 404 })
    }

    const awalHari = new Date()
    awalHari.setHours(0, 0, 0, 0)

    const akhirHari = new Date()
    akhirHari.setHours(23, 59, 59, 999)

    // C. Satu murid hanya punya satu absensi per hari. Baris yang sudah ada
    // dikunci: guru lain tidak boleh menulisnya lagi.
    // Kunci advisory per (murid, tanggal) menutup balapan dua guru yang
    // menyimpan absensi murid yang sama pada detik yang bersamaan.
    const kunciHari = `absensi:${data.muridId}:${awalHari.toISOString().slice(0, 10)}`

    const hasil = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${kunciHari}))`

      const catatanHariIni = await tx.absensi.findFirst({
        where: {
          muridId: data.muridId,
          tanggal: { gte: awalHari, lte: akhirHari },
        },
        orderBy: { tanggal: "desc" },
        include: {
          guru: { select: { nama: true } },
        },
      })

      if (catatanHariIni) {
        return { status: "konflik" as const, pencatat: catatanHariIni.guru?.nama || null }
      }

      const absensiBaru = await tx.absensi.create({
        data: {
          muridId: data.muridId,
          guruId: payload.id, // ID pencatat didapat dengan aman dari token JWT internal backend
          status: data.status,
        },
      })

      return { status: "dibuat" as const, data: absensiBaru }
    })

    if (hasil.status === "konflik") {
      // Satu murid hanya satu absensi per hari dan pencatatnya mengunci baris ini.
      // Koreksi hanya bisa dilakukan admin lewat PATCH /api/absensi/[id].
      return Response.json(
        {
          message: "Murid sudah diabsen hari ini dan tidak bisa diabsen ulang oleh guru lain.",
          pencatat: hasil.pencatat,
        },
        { status: 409 },
      )
    }

    // D. Simpan ke database PostgreSQL
    return Response.json(
      { message: "Absensi murid berhasil dicatat", data: hasil.data },
      { status: 201 },
    )
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    if (error instanceof z.ZodError) {
      return Response.json(
        { message: "Format data tidak valid", errors: error.issues },
        { status: 400 },
      )
    }

    console.error("DETAIL ERROR ABSENSI:", error)
    return Response.json({ message: "Gagal mencatat absensi" }, { status: 500 })
  }
}

// 2. ENDPOINT: LIHAT RIWAYAT ABSENSI MURID (GET)
export async function GET(req: Request) {
  try {
    // WAJIB LOGIN: riwayat absensi berisi nama murid & guru
    await wajibAuth(req)

    // Semua filter dikerjakan di server supaya respons tidak tumbuh tanpa batas.
    const params = new URL(req.url).searchParams
    const AND: Prisma.AbsensiWhereInput[] = []

    // ?hariIni=1 dipakai dashboard guru (hanya catatan hari ini).
    if (params.get("hariIni") === "1") {
      const sekarang = new Date()
      AND.push({ tanggal: { gte: mulaiHari(sekarang), lte: akhirHari(sekarang) } })
    }

    // Rentang tanggal opsional (YYYY-MM-DD, batas hari server-local).
    const tanggalMulai = params.get("tanggalMulai")
    if (tanggalMulai && /^\d{4}-\d{2}-\d{2}$/.test(tanggalMulai)) {
      AND.push({ tanggal: { gte: mulaiHari(dariISOHari(tanggalMulai)) } })
    }

    const tanggalSelesai = params.get("tanggalSelesai")
    if (tanggalSelesai && /^\d{4}-\d{2}-\d{2}$/.test(tanggalSelesai)) {
      AND.push({ tanggal: { lte: akhirHari(dariISOHari(tanggalSelesai)) } })
    }

    const kelas = params.get("kelas")
    if (kelas && (KELAS_OPTIONS as readonly string[]).includes(kelas)) {
      AND.push({ murid: { kelas: kelas as Kelas } })
    }

    const cari = params.get("cari")
    if (cari) {
      AND.push({ murid: { namaLengkap: { contains: cari, mode: "insensitive" } } })
    }

    const batas = Math.min(Math.max(Number(params.get("batas")) || 1000, 1), 2000)

    const riwayatAbsensi = await prisma.absensi.findMany({
      where: AND.length > 0 ? { AND } : undefined,
      include: {
        murid: {
          select: {
            id: true,
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
      take: batas,
    })

    return Response.json(riwayatAbsensi)
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("DETAIL ERROR GET ABSENSI:", error)
    return Response.json({ message: "Gagal mengambil data riwayat absensi" }, { status: 500 })
  }
}
