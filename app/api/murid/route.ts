import prisma from "@/lib/prisma"
import { z } from "zod"

const muridSchema = z.object({
  namaLengkap: z.string(),
  namaPanggilan: z.string(),
  kelas: z.string(),
  sekolahAsal: z.string(),
  namaOrangTuaWali: z.string(),
  pekerjaanAyah: z.string(),
  pekerjaanIbu: z.string(),
  alamatDomisili: z.string(),
  noHpOrangTua: z.string(),
  hari: z.string(),
  jam: z.string(),
  pembayaran: z.string(),
  mapel: z.string(),
  catatanAnak: z.string().optional().nullable(), // Tambahkan nullable agar aman jika dikirim string kosong/null
  guruId: z.string().optional().nullable(), // UBAH BARIS INI agar Zod tidak error jika nilainya null
})


// TAMBAH MURID
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = muridSchema.parse(body)

    // Memetakan struktur data secara eksplisit ke model Prisma
    const muridBaru = await prisma.murid.create({
      data: {
        namaLengkap: data.namaLengkap,
        namaPanggilan: data.namaPanggilan,
        kelas: data.kelas,
        sekolahAsal: data.sekolahAsal,
        namaOrangTuaWali: data.namaOrangTuaWali,
        pekerjaanAyah: data.pekerjaanAyah,
        pekerjaanIbu: data.pekerjaanIbu,
        alamatDomisili: data.alamatDomisili,
        noHpOrangTua: data.noHpOrangTua,
        hari: data.hari,
        jam: data.jam,
        pembayaran: data.pembayaran,
        mapel: data.mapel,
        catatanAnak: data.catatanAnak || null,
        guruId: data.guruId || null, // ⚠️ ID ini harus berwujud string UUID Guru yang valid di database!
      },
    })

    return Response.json({ message: "Murid berhasil ditambahkan", data: muridBaru }, { status: 201 })
  } catch (error) {
    // 1. Cek jika kesalahan ada pada format data yang dikirim (Zod Error)
    if (error instanceof z.ZodError) {
    return Response.json({ message: "Format data yang dikirim tidak valid", errors: error.issues }, { status: 400 })
    }

    // 2. Tampilkan log error database asli ke terminal backend VSCode Anda
    console.error("DETAIL ERROR DATABASE:", error)
    return Response.json({ message: "Gagal menambahkan murid", detail: error instanceof Error ? error.message : error }, { status: 500 })
  }
}

// AMBIL SEMUA MURID
export async function GET() {
  try {
    const semuaMurid = await prisma.murid.findMany({
      include: {
        guru: { select: { nama: true, email: true } } 
      }
    })
    return Response.json(semuaMurid)
  } catch (error) {
    console.error("DETAIL ERROR GET MURID:", error)
    return Response.json({ message: "Gagal mengambil data murid" }, { status: 500 })
  }
}
