import { responError } from "@/lib/api-response"
import prisma from "@/lib/prisma"
import { responGuard, wajibAdmin } from "@/lib/api-guard"
import {
  BARIS_CONTOH,
  HEADER_EKSPOR,
  buatWorkbookXlsx,
  keCsv,
  workbookKeXlsx,
} from "@/lib/murid-import-export"

function formatTanggalEkspor(tanggal: Date): string {
  const hari = String(tanggal.getDate()).padStart(2, "0")
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0")
  return `${hari}/${bulan}/${tanggal.getFullYear()}`
}

// =========================
// EXPORT DATA MURID (CSV / Excel)
// =========================
export async function GET(req: Request) {
  try {
    await wajibAdmin(req)

    const { searchParams } = new URL(req.url)
    const template = searchParams.get("template") === "1"
    const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv"
    const tanggalHariIni = new Date().toISOString().slice(0, 10)

    let baris: string[][]

    if (template) {
      baris = [HEADER_EKSPOR, ...BARIS_CONTOH]
    } else {
      const semuaMurid = await prisma.murid.findMany({
        include: { guru: { select: { nama: true } } },
        orderBy: [{ kelas: "asc" }, { namaLengkap: "asc" }],
      })

      baris = [
        HEADER_EKSPOR,
        ...semuaMurid.map((murid) => [
          murid.namaLengkap,
          murid.namaPanggilan,
          murid.kelas,
          murid.sekolahAsal,
          murid.namaOrangTuaWali,
          murid.pekerjaanAyah || "",
          murid.pekerjaanIbu || "",
          murid.alamatDomisili,
          murid.noHpOrangTua,
          murid.hari,
          murid.jam,
          murid.mapel,
          murid.pembayaran,
          murid.catatanAnak || "",
          murid.guru?.nama || "",
          formatTanggalEkspor(new Date(murid.tanggalMasuk)),
        ]),
      ]
    }

    const namaFile = template
      ? "template-import-murid.csv"
      : `data-murid-${tanggalHariIni}.${format}`

    const headerDasar = {
      "Content-Disposition": `attachment; filename="${namaFile}"`,
      "Cache-Control": "no-store",
    }

    if (format === "xlsx") {
      const workbook = buatWorkbookXlsx(baris, template ? "Template" : "Data Murid")
      const isi = workbookKeXlsx(workbook)
      return new Response(isi as unknown as BodyInit, {
        headers: {
          ...headerDasar,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      })
    }

    return new Response(keCsv(baris), {
      headers: {
        ...headerDasar,
        "Content-Type": "text/csv; charset=utf-8",
      },
    })
  } catch (error) {
    const guard = responGuard(error)
    if (guard) return guard

    console.error("DETAIL ERROR EXPORT MURID:", error)

    return responError(500, "Gagal mengekspor data murid")
  }
}
