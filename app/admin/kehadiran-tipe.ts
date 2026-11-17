export interface MuridRingkas {
  id: string
  namaLengkap: string
  namaPanggilan: string
  kelas: string
}

export interface LogAbsensiMurid {
  id: string
  tanggal: string
  status: string
  murid: { id: string; namaLengkap: string; kelas: string }
  guru: { nama: string } | null
}

export interface RingkasanMurid {
  murid: MuridRingkas
  catatan: LogAbsensiMurid[]
  hitung: Record<string, number>
  total: number
  persenHadir: number | null
}

export interface RekapStatus {
  value: string
  label: string
  select: string
  badge: string
  jumlah: number
}

export type TampilkanNotifikasi = (title: string, message: string, isSuccess?: boolean) => void
