export interface UserProfile {
  nama: string
  email: string
  peran: string
}

export interface Murid {
  id: string
  namaLengkap: string
  kelas: string
}

export interface LogAbsenGuru {
  id: string
  waktuMasuk: string
  waktuPulang: string | null
}

export interface RingkasanMurid {
  total: number
  perKelas: Record<string, number>
}
