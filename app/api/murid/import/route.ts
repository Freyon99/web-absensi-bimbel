import prisma from "@/lib/prisma"
import { responGuard, wajibAdmin } from "@/lib/api-guard"
import {
  BARIS_MAKS_FILE,
  FileImportError,
  UKURAN_MAKS_FILE,
  jumlahHeaderDikenali,
  labelKolom,
  normalisasiKelas,
  normalisasiPembayaran,
  parseFileMurid,
  terjemahHeader,
} from "@/lib/murid-import-export"
import { Kelas } from "@prisma/client"

interface DataMuridBaru {
  namaLengkap: string
  namaPanggilan: string
  kelas: Kelas
  sekolahAsal: string
  namaOrangTuaWali: string
  pekerjaanAyah: string
  pekerjaanIbu: string
  alamatDomisili: string
  noHpOrangTua: string
  hari: string
  jam: string
  pembayaran: string
  mapel: string
  catatanAnak: string | null
  guruId: string | null
}

interface KendalaBaris {
  row: number
  message: string
}

const KOLOM_WAJIB = [
  "namaLengkap",
  "namaPanggilan",
  "kelas",
  "sekolahAsal",
  "namaOrangTuaWali",
  "alamatDomisili",
  "noHpOrangTua",
  "hari",
  "jam",
  "mapel",
]

function normalisasiKunci(teks: string): string {
  return teks.toLowerCase().replace(/[^a-z0-9]/g, "")
}

// =========================
// IMPORT DATA MURID (CSV / Excel)
// =========================
export async function POST(req: Request) {
  try {
    const payload = await wajibAdmin(req)
    const idAdmin = payload.id as string | undefined

    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return Response.json(
        {
          message:
            "File tidak ditemukan. Kirim file pada kolom 'file' dengan multipart/form-data.",
        },
        { status: 400 }
      )
    }

    const entri = formData.get("file")

    if (!entri || typeof entri === "string") {
      return Response.json(
        { message: "File tidak ditemukan. Unggah file pada kolom 'file'." },
        { status: 400 }
      )
    }

    const file = entri as File

    if (file.size === 0) {
      return Response.json({ message: "File yang diunggah kosong." }, { status: 400 })
    }

    if (file.size > UKURAN_MAKS_FILE) {
      return Response.json({ message: "Ukuran file maksimal 5 MB." }, { status: 400 })
    }

    let baris: string[][]
    try {
      baris = parseFileMurid(file.name, new Uint8Array(await file.arrayBuffer()))
    } catch (error) {
      const pesan =
        error instanceof FileImportError
          ? error.message
          : "File tidak dapat dibaca. Pastikan file tidak rusak."
      return Response.json({ message: pesan }, { status: 400 })
    }

    if (baris.length < 2) {
      return Response.json(
        {
          message:
            "File tidak memiliki baris data. Baris pertama harus berisi header kolom.",
        },
        { status: 400 }
      )
    }

    if (baris.length - 1 > BARIS_MAKS_FILE) {
      return Response.json(
        { message: `Jumlah baris melewati batas maksimal ${BARIS_MAKS_FILE} baris.` },
        { status: 400 }
      )
    }

    const kunciHeader = terjemahHeader(baris[0])
    if (jumlahHeaderDikenali(baris[0]) === 0) {
      return Response.json(
        {
          message:
            "Header kolom tidak dikenali. Unduh template import untuk format yang benar.",
        },
        { status: 400 }
      )
    }

    // =========================
    // SIAPKAN REFERENSI: guru & data yang sudah ada
    // =========================
    const [semuaPengguna, muridLama] = await Promise.all([
      prisma.pengguna.findMany({ select: { id: true, nama: true, email: true } }),
      prisma.murid.findMany({ select: { namaLengkap: true, noHpOrangTua: true } }),
    ])

    const petaPengguna = new Map<string, string>()
    for (const pengguna of semuaPengguna) {
      petaPengguna.set(normalisasiKunci(pengguna.nama), pengguna.id)
      if (pengguna.email) petaPengguna.set(normalisasiKunci(pengguna.email), pengguna.id)
    }

    const kunciMuridLama = new Set(
      muridLama
        .filter((item) => item.noHpOrangTua.trim() !== "")
        .map(
          (item) =>
            `${normalisasiKunci(item.namaLengkap)}|${normalisasiKunci(item.noHpOrangTua)}`
        )
    )

    // =========================
    // VALIDASI BARIS DEMI BARIS
    // =========================
    const dataValid: { row: number; data: DataMuridBaru }[] = []
    const kendala: KendalaBaris[] = []
    let totalBaris = 0
    let dilewatiDuplikat = 0

    for (let indeks = 1; indeks < baris.length; indeks++) {
      const nomorBaris = indeks + 1
      const nilai: Record<string, string> = {}

      kunciHeader.forEach((kunci, kolom) => {
        if (kunci) nilai[kunci] = baris[indeks][kolom] ?? ""
      })

      if (Object.values(nilai).every((value) => value.trim() === "")) continue

      totalBaris++

      const kolomKosong = KOLOM_WAJIB.filter((kunci) => !nilai[kunci]?.trim())
      if (kolomKosong.length > 0) {
        kendala.push({
          row: nomorBaris,
          message: `Kolom wajib belum diisi: ${kolomKosong.map(labelKolom).join(", ")}.`,
        })
        continue
      }

      const kelas = normalisasiKelas(nilai.kelas)
      if (!kelas.ok) {
        kendala.push({ row: nomorBaris, message: kelas.pesan || "Kelas tidak valid." })
        continue
      }

      const pembayaran = normalisasiPembayaran(nilai.pembayaran)
      if (!pembayaran.ok) {
        kendala.push({ row: nomorBaris, message: pembayaran.pesan || "Status pembayaran tidak valid." })
        continue
      }

      let guruId: string | null = idAdmin ?? null
      const teksGuru = nilai.guru?.trim()
      if (teksGuru) {
        const cocok = petaPengguna.get(normalisasiKunci(teksGuru))
        if (!cocok) {
          kendala.push({
            row: nomorBaris,
            message: `Guru "${teksGuru}" tidak ditemukan di database. Isikan nama/email pengguna yang terdaftar.`,
          })
          continue
        }
        guruId = cocok
      }

      const kunciDuplikat =
        `${normalisasiKunci(nilai.namaLengkap)}|${normalisasiKunci(nilai.noHpOrangTua)}`

      if (kunciMuridLama.has(kunciDuplikat)) {
        dilewatiDuplikat++
        kendala.push({
          row: nomorBaris,
          message: "Duplikat: data dengan nama dan No HP yang sama sudah ada di database.",
        })
        continue
      }
      kunciMuridLama.add(kunciDuplikat)

      dataValid.push({
        row: nomorBaris,
        data: {
          namaLengkap: nilai.namaLengkap.trim(),
          namaPanggilan: nilai.namaPanggilan.trim(),
          kelas: kelas.value as Kelas,
          sekolahAsal: nilai.sekolahAsal.trim(),
          namaOrangTuaWali: nilai.namaOrangTuaWali.trim(),
          pekerjaanAyah: nilai.pekerjaanAyah?.trim() || "",
          pekerjaanIbu: nilai.pekerjaanIbu?.trim() || "",
          alamatDomisili: nilai.alamatDomisili.trim(),
          noHpOrangTua: nilai.noHpOrangTua.trim(),
          hari: nilai.hari.trim(),
          jam: nilai.jam.trim(),
          pembayaran: pembayaran.value,
          mapel: nilai.mapel.trim(),
          catatanAnak: nilai.catatanAnak?.trim() ? nilai.catatanAnak.trim() : null,
          guruId,
        },
      })
    }

    const gagal = kendala.filter((item) => !item.message.startsWith("Duplikat:")).length

    if (dataValid.length === 0) {
      return Response.json(
        {
          message: "Tidak ada baris data yang valid untuk diimpor.",
          summary: { total: totalBaris, success: 0, skipped: dilewatiDuplikat, failed: gagal },
          errors: kendala.slice(0, 50),
        },
        { status: 400 }
      )
    }

    // =========================
    // SIMPAN KE DATABASE
    // =========================
    let berhasil = 0

    try {
      const hasil = await prisma.murid.createMany({
        data: dataValid.map((item) => item.data),
      })
      berhasil = hasil.count
    } catch (error) {
      // createMany gagal (mis. data terlalu panjang). Ulangi satu per satu
      // agar baris yang bermasalah tetap teridentifikasi.
      console.error("IMPORT createMany GAGAL, coba per baris:", error)

      for (const item of dataValid) {
        try {
          await prisma.murid.create({ data: item.data })
          berhasil++
        } catch (kesalahanBaris) {
          kendala.push({
            row: item.row,
            message:
              kesalahanBaris instanceof Error
                ? kesalahanBaris.message
                : "Gagal menyimpan baris data.",
          })
        }
      }
    }

    kendala.sort((a, b) => a.row - b.row)

    const gagalAkhir = kendala.filter((item) => !item.message.startsWith("Duplikat:")).length

    return Response.json({
      message:
        berhasil > 0
          ? `Import selesai: ${berhasil} data murid baru berhasil ditambahkan.`
          : "Import selesai, tetapi tidak ada data baru yang tersimpan.",
      summary: {
        total: totalBaris,
        success: berhasil,
        skipped: dilewatiDuplikat,
        failed: gagalAkhir,
      },
      errors: kendala.slice(0, 50),
    })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("DETAIL ERROR IMPORT MURID:", error)

    return Response.json({ message: "Gagal mengimpor data murid" }, { status: 500 })
  }
}
