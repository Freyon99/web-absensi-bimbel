import { responError, responJson } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { Kelas, Prisma } from "@prisma/client"
import { responGuard, wajibAdmin, wajibAuth } from "@/lib/api-guard"
import { KELAS_OPTIONS } from "@/lib/kelas"

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
    const payload = await wajibAdmin(req)

    const body = await req.json()

    const data = muridSchema.parse(body)

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

    return responJson(
      {
        message: "Murid berhasil ditambahkan",
        data: muridBaru,
      },
      { status: 201 },
    )
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("DETAIL ERROR DATABASE:", error)

    if (error instanceof z.ZodError) {
      return responJson(
        {
          message: "Format data tidak valid",
          errors: error.issues,
        },
        { status: 400 },
      )
    }

    return responError(500, "Gagal menambahkan murid")
  }
}
// AMBIL SEMUA MURID
export async function GET(req: Request) {
  try {
    // WAJIB LOGIN: data murid hanya untuk pengguna terautentikasi
    await wajibAuth(req)

    // Filter di server supaya dashboard cukup mengambil kelas yang dibuka.
    const params = new URL(req.url).searchParams
    const where: Prisma.MuridWhereInput = {}

    const kelas = params.get("kelas")
    if (kelas && (KELAS_OPTIONS as readonly string[]).includes(kelas)) {
      where.kelas = kelas as Kelas
    }

    const cari = params.get("cari")
    if (cari) {
      where.namaLengkap = { contains: cari, mode: "insensitive" }
    }

    const pembayaran = params.get("pembayaran")
    if (pembayaran) where.pembayaran = pembayaran

    // Paginasi berbasis offset: Data Siswa admin meminta per halaman.
    const batas = Math.min(Math.max(Number(params.get("batas")) || 50, 1), 500)
    const mulai = Math.max(Number(params.get("mulai")) || 0, 0)

    const semuaMurid = await prisma.murid.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: {
        tanggalMasuk: "desc",
      },
      skip: mulai,
      take: batas,
    })

    return responJson(semuaMurid)
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("DETAIL ERROR GET MURID:", error)

    return responJson(
      {
        message: "Gagal mengambil data murid",
      },
      {
        status: 500,
      },
    )
  }
}
