import * as XLSX from "xlsx"
import { Kelas } from "@prisma/client"

export interface KolomMurid {
  key: string
  label: string
  required: boolean
  alias: string[]
}

/**
 * Definisi kolom yang dipakai bersama oleh fitur export & import data murid.
 * Label kolom dipakai sebagai header pada file export dan template.
 */
export const KOLOM_MURID: KolomMurid[] = [
  { key: "namaLengkap", label: "Nama Lengkap", required: true, alias: ["nama"] },
  { key: "namaPanggilan", label: "Nama Panggilan", required: true, alias: ["panggilan"] },
  { key: "kelas", label: "Kelas", required: true, alias: ["tingkat", "kelas tingkat"] },
  { key: "sekolahAsal", label: "Sekolah Asal", required: true, alias: ["sekolah"] },
  {
    key: "namaOrangTuaWali",
    label: "Nama Orang Tua/Wali",
    required: true,
    alias: ["orang tua", "wali"],
  },
  { key: "pekerjaanAyah", label: "Pekerjaan Ayah", required: false, alias: [] },
  { key: "pekerjaanIbu", label: "Pekerjaan Ibu", required: false, alias: [] },
  { key: "alamatDomisili", label: "Alamat Domisili", required: true, alias: ["alamat"] },
  {
    key: "noHpOrangTua",
    label: "No HP Orang Tua",
    required: true,
    alias: ["no hp", "nomor hp", "hp", "telepon"],
  },
  { key: "hari", label: "Hari Les", required: true, alias: [] },
  { key: "jam", label: "Jam Les", required: true, alias: [] },
  { key: "mapel", label: "Mata Pelajaran", required: true, alias: ["mata pelajaran"] },
  {
    key: "pembayaran",
    label: "Status Pembayaran",
    required: true,
    alias: ["pembayaran", "status"],
  },
  { key: "catatanAnak", label: "Catatan Anak", required: false, alias: ["catatan"] },
  { key: "guru", label: "Guru", required: false, alias: ["nama guru", "pengajar"] },
]

/** Header file export: label kolom + kolom tambahan yang hanya untuk baca. */
export const HEADER_EKSPOR = [...KOLOM_MURID.map((kolom) => kolom.label), "Tanggal Masuk"]

export const UKURAN_MAKS_FILE = 5 * 1024 * 1024 // 5 MB
export const BARIS_MAKS_FILE = 5000

export class FileImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "FileImportError"
  }
}

function normalisasiTeks(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString()
  return String(value).trim()
}

/** "SD 1", "sd_1", dan "SD_1" dinormalkan menjadi "sd1" agar mudah dicocokkan. */
function normalisasiKunci(teks: string): string {
  return teks.toLowerCase().replace(/[^a-z0-9]/g, "")
}

const PETA_KOLOM: Record<string, string> = {}
for (const kolom of KOLOM_MURID) {
  PETA_KOLOM[normalisasiKunci(kolom.label)] = kolom.key
  PETA_KOLOM[normalisasiKunci(kolom.key)] = kolom.key
  for (const alias of kolom.alias) {
    PETA_KOLOM[normalisasiKunci(alias)] = kolom.key
  }
}

const PETA_KELAS: Record<string, Kelas> = {}
for (const kelas of Object.values(Kelas)) {
  PETA_KELAS[normalisasiKunci(kelas)] = kelas
}

export function labelKolom(key: string): string {
  return KOLOM_MURID.find((kolom) => kolom.key === key)?.label ?? key
}

/**
 * Terjemahkan header file menjadi kunci kolom yang dikenal.
 * Header yang tidak dikenali diabaikan (null) agar file export lama tetap bisa diimpor.
 */
export function terjemahHeader(header: string[]): (string | null)[] {
  return header.map((sel) => PETA_KOLOM[normalisasiKunci(sel)] ?? null)
}

export function jumlahHeaderDikenali(header: string[]): number {
  return terjemahHeader(header).filter(Boolean).length
}

export function normalisasiKelas(nilai: string): { ok: boolean; value?: Kelas; pesan?: string } {
  const value = PETA_KELAS[normalisasiKunci(nilai)]
  if (!value) {
    return {
      ok: false,
      pesan: `Kelas "${nilai}" tidak dikenali. Pilihan yang valid: ${Object.values(Kelas).join(", ")}.`,
    }
  }
  return { ok: true, value }
}

export function normalisasiPembayaran(nilai: string): {
  ok: boolean
  value: string
  pesan?: string
} {
  const teks = nilai.trim().toUpperCase()
  if (!teks) return { ok: true, value: "BELUM LUNAS" }

  const kunci = normalisasiKunci(teks)
  if (kunci.includes("belum")) return { ok: true, value: "BELUM LUNAS" }
  if (kunci.includes("lunas")) return { ok: true, value: "LUNAS" }

  return {
    ok: false,
    value: "",
    pesan: `Status pembayaran "${nilai}" tidak dikenali. Gunakan LUNAS atau BELUM LUNAS.`,
  }
}

/** Contoh isi template supaya admin langsung tahu format yang benar. */
export const BARIS_CONTOH: string[][] = [
  [
    "Contoh: Budi Santoso",
    "Budi",
    "SD_1",
    "SDN 1 Merdeka",
    "Bapak Santoso",
    "Wiraswasta",
    "Guru",
    "Jl. Merdeka No. 1, Jakarta",
    "081234567890",
    "Senin, Rabu",
    "16:00 - 18:00",
    "Matematika",
    "BELUM LUNAS",
    "Anak aktif dan rajin.",
    "",
    "01/09/2026",
  ],
  [
    "Contoh: Siti Rahma",
    "Siti",
    "CALISTUNG",
    "TK Bunga Bangsa",
    "Ibu Rahma",
    "",
    "Ibu Rumah Tangga",
    "Jl. Kenanga No. 5, Bekasi",
    "081345678901",
    "Selasa, Kamis",
    "09:00 - 10:30",
    "Membaca & Menulis",
    "LUNAS",
    "",
    "Bapak Ahmad",
    "02/09/2026",
  ],
]

function escapeCsv(nilai: string): string {
  if (/[",\r\n]/.test(nilai)) {
    return `"${nilai.replace(/"/g, '""')}"`
  }
  return nilai
}

/** Serialisasi CSV dengan BOM agar langsung rapi dibuka Excel. */
export function keCsv(baris: string[][]): string {
  const isi = baris.map((barisKolom) => barisKolom.map(escapeCsv).join(",")).join("\r\n")
  return `\uFEFF${isi}`
}

export function buatWorkbookXlsx(baris: string[][], namaSheet = "Data Murid"): XLSX.WorkBook {
  const sheet = XLSX.utils.aoa_to_sheet(baris)
  sheet["!cols"] = HEADER_EKSPOR.map((label) => ({ wch: Math.max(label.length + 4, 18) }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, namaSheet)
  return workbook
}

export function workbookKeXlsx(workbook: XLSX.WorkBook): Uint8Array {
  const hasil = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  })
  return hasil instanceof Uint8Array ? hasil : new Uint8Array(hasil as ArrayBuffer)
}

/** CSV dari Excel Indonesia sering memakai pemisah titik koma dan encoding ANSI. */
function decodeCsv(buffer: Uint8Array): string {
  const tanpaBom =
    buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf ? buffer.slice(3) : buffer

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(tanpaBom)
  } catch {
    return new TextDecoder("windows-1252").decode(tanpaBom)
  }
}

function pemisahCsv(teks: string): string {
  const contoh = teks.split(/\r?\n/).find((baris) => baris.trim()) ?? ""
  const jumlahKoma = contoh.split(",").length
  const jumlahTitikKoma = contoh.split(";").length
  return jumlahTitikKoma > jumlahKoma ? ";" : ","
}

/**
 * Baca file CSV/XLS/XLSX menjadi matriks teks.
 * Baris pertama dianggap header; baris kosong di bagian akhir dibuang.
 */
export function parseFileMurid(namaFile: string, buffer: Uint8Array): string[][] {
  const ekstensi = namaFile.toLowerCase().split(".").pop() ?? ""
  let workbook: XLSX.WorkBook

  if (ekstensi === "csv") {
    const teks = decodeCsv(buffer)
    workbook = XLSX.read(teks, { type: "string", FS: pemisahCsv(teks) })
  } else if (ekstensi === "xlsx" || ekstensi === "xls") {
    workbook = XLSX.read(buffer, { type: "array" })
  } else {
    throw new FileImportError("Format file tidak didukung. Gunakan file .csv, .xlsx, atau .xls.")
  }

  const namaSheet = workbook.SheetNames[0]
  if (!namaSheet) {
    throw new FileImportError("File tidak memiliki sheet data.")
  }

  const mentah = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[namaSheet], {
    header: 1,
    raw: false,
    defval: "",
  })

  const baris = mentah.map((barisMentah) =>
    Array.isArray(barisMentah) ? barisMentah.map(normalisasiTeks) : [],
  )

  while (baris.length > 0 && baris[baris.length - 1].every((sel) => sel === "")) {
    baris.pop()
  }

  return baris
}
