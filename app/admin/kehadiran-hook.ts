"use client"

import { useEffect, useState, type FormEvent } from "react"
import { fetchApi } from "@/lib/api-client"
import { akhirHari, keISOHari, mulaiHari } from "@/lib/tanggal"
import { BATCH_RIWAYAT, BATAS_RIWAYAT, STATUS_ABSENSI, STATUS_LABEL } from "./kehadiran-konstanta"
import {
  akhirBulan,
  akhirMinggu,
  dalamRentang,
  formatRentang,
  mulaiBulan,
  mulaiMinggu,
  tambahBulan,
  tambahHari,
  type ModePeriode,
} from "./kehadiran-periode"
import type {
  LogAbsensiMurid,
  MuridRingkas,
  RekapStatus,
  RingkasanMurid,
  TampilkanNotifikasi,
} from "./kehadiran-tipe"

async function muatRiwayatAbsensi(mulaiISO: string, selesaiISO: string) {
  try {
    // Filter di server: hanya rentang yang sedang dilihat yang dikembalikan.
    const res = await fetchApi(
      `/api/absensi?tanggalMulai=${mulaiISO}&tanggalSelesai=${selesaiISO}&batas=${BATAS_RIWAYAT}`,
    )
    if (res.ok) return (await res.json()) as LogAbsensiMurid[]
  } catch (error) {
    console.error("Gagal memuat riwayat absensi murid:", error)
  }
  return null
}

/**
 * Seluruh state, efek fetch, dan data turunan menu "Absensi Siswa" admin.
 * Komponen presenter hanya merender hasilnya.
 */
export function useKehadiranSiswa(showNotification: TampilkanNotifikasi) {
  const [kelasAbsensi, setKelasAbsensi] = useState("CALISTUNG")
  // Murid diambil khusus untuk kelas yang sedang dibuka, bukan semua murid.
  const [muridPerKelas, setMuridPerKelas] = useState<MuridRingkas[]>([])
  const [modePeriode, setModePeriode] = useState<ModePeriode>("HARIAN")
  const [tanggalAktif, setTanggalAktif] = useState(() => keISOHari(new Date()))
  const [riwayatAbsensiMurid, setRiwayatAbsensiMurid] = useState<LogAbsensiMurid[]>([])
  const [filterRiwayatKelas, setFilterRiwayatKelas] = useState("")
  const [filterRiwayatStatus, setFilterRiwayatStatus] = useState("")
  const [riwayatSearch, setRiwayatSearch] = useState("")
  const [halamanRiwayat, setHalamanRiwayat] = useState(1)

  // Koreksi absensi hanya untuk admin
  const [absensiTerpilih, setAbsensiTerpilih] = useState<LogAbsensiMurid | null>(null)
  const [statusKoreksi, setStatusKoreksi] = useState("HADIR")
  const [isMenyimpanKoreksi, setIsMenyimpanKoreksi] = useState(false)

  // Geser jangkauan tanggal yang sedang dilihat (harian/mingguan/bulanan).
  const geserPeriode = (selisih: number) => {
    const jarum = new Date(`${tanggalAktif}T00:00:00`)
    const baru =
      modePeriode === "BULANAN"
        ? tambahBulan(jarum, selisih)
        : tambahHari(jarum, selisih * (modePeriode === "MINGGUAN" ? 7 : 1))

    setTanggalAktif(keISOHari(baru))
  }

  const pilihTanggal = (nilai: string) => {
    if (!nilai) return
    setTanggalAktif(nilai)
  }

  const bukaModalKoreksi = (item: LogAbsensiMurid) => {
    setAbsensiTerpilih(item)
    setStatusKoreksi(item.status)
  }

  const handleKoreksiAbsensi = async (e: FormEvent) => {
    e.preventDefault()
    if (!absensiTerpilih || isMenyimpanKoreksi) return

    setIsMenyimpanKoreksi(true)

    try {
      const res = await fetchApi(`/api/absensi/${absensiTerpilih.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusKoreksi }),
      })
      const data = await res.json().catch(() => null)

      if (res.ok) {
        showNotification(
          "Koreksi Tersimpan",
          `Status ${data?.data?.murid?.namaLengkap || absensiTerpilih.murid.namaLengkap} diubah menjadi ${STATUS_LABEL[statusKoreksi]}.`,
          true,
        )
        setAbsensiTerpilih(null)
        const dataRiwayat = await muatRiwayatAbsensi(mulaiISO, selesaiISO)
        if (dataRiwayat) setRiwayatAbsensiMurid(dataRiwayat)
      } else {
        showNotification(
          "Gagal Mengoreksi",
          data?.message || "Terjadi kesalahan saat mengoreksi absensi.",
          false,
        )
      }
    } catch {
      showNotification("Error", "Terjadi kesalahan jaringan", false)
    } finally {
      setIsMenyimpanKoreksi(false)
    }
  }

  // ===== Data turunan (read-only) =====
  const jarumTanggal = new Date(`${tanggalAktif}T00:00:00`)

  const rentangAktif = (() => {
    if (modePeriode === "MINGGUAN") {
      const mulai = mulaiMinggu(jarumTanggal)
      const selesai = akhirMinggu(mulai)
      return { mulai, selesai, label: formatRentang(mulai, selesai, modePeriode) }
    }

    if (modePeriode === "BULANAN") {
      const mulai = mulaiBulan(jarumTanggal)
      const selesai = akhirBulan(mulai)
      return { mulai, selesai, label: formatRentang(mulai, selesai, modePeriode) }
    }

    return {
      mulai: mulaiHari(jarumTanggal),
      selesai: akhirHari(jarumTanggal),
      label: formatRentang(mulaiHari(jarumTanggal), akhirHari(jarumTanggal), modePeriode),
    }
  })()

  const mulaiISO = keISOHari(rentangAktif.mulai)
  const selesaiISO = keISOHari(rentangAktif.selesai)

  useEffect(() => {
    const muat = async () => {
      const data = await muatRiwayatAbsensi(mulaiISO, selesaiISO)
      if (data) setRiwayatAbsensiMurid(data)
    }
    void muat()
  }, [mulaiISO, selesaiISO])

  // Daftar murid kelas ini diambil terpisah dari absensi.
  useEffect(() => {
    const muat = async () => {
      try {
        const res = await fetchApi(`/api/murid?kelas=${encodeURIComponent(kelasAbsensi)}`)
        if (res.ok) {
          const data: MuridRingkas[] = await res.json()
          setMuridPerKelas(data)
        }
      } catch (error) {
        console.error("Gagal memuat murid:", error)
      }
    }
    void muat()
  }, [kelasAbsensi])

  const absensiDalamRentang = riwayatAbsensiMurid.filter((item) =>
    dalamRentang(item.tanggal, rentangAktif.mulai, rentangAktif.selesai),
  )

  const rekapPeriode: RekapStatus[] = STATUS_ABSENSI.map((status) => ({
    ...status,
    jumlah: absensiDalamRentang.filter((item) => item.status === status.value).length,
  }))

  // Ringkasan per murid untuk jangkauan yang dipilih.
  const ringkasanMurid: RingkasanMurid[] = muridPerKelas.map((murid) => {
    const catatan = absensiDalamRentang.filter((item) => item.murid.id === murid.id)
    const hitung = STATUS_ABSENSI.reduce<Record<string, number>>((acc, status) => {
      acc[status.value] = catatan.filter((item) => item.status === status.value).length
      return acc
    }, {})

    const total = catatan.length

    return {
      murid,
      catatan,
      hitung,
      total,
      persenHadir: total > 0 ? Math.round((hitung.HADIR / total) * 100) : null,
    }
  })

  const jumlahBelumTercatat = ringkasanMurid.filter((item) => item.total === 0).length

  const normalizePencarian = (nilai: string) => nilai.trim().toLowerCase()

  const riwayatAbsensiTampil = absensiDalamRentang.filter((item) => {
    const cocokKelas = filterRiwayatKelas ? item.murid.kelas === filterRiwayatKelas : true
    const cocokStatus = filterRiwayatStatus ? item.status === filterRiwayatStatus : true
    const kataKunci = normalizePencarian(riwayatSearch)
    const cocokNama = kataKunci ? item.murid.namaLengkap.toLowerCase().includes(kataKunci) : true

    return cocokKelas && cocokStatus && cocokNama
  })

  const totalHalamanRiwayat = Math.max(1, Math.ceil(riwayatAbsensiTampil.length / BATCH_RIWAYAT))
  const halamanAktifRiwayat = Math.min(halamanRiwayat, totalHalamanRiwayat)
  const riwayatDitampilkan = riwayatAbsensiTampil.slice(0, halamanAktifRiwayat * BATCH_RIWAYAT)

  return {
    kelasAbsensi,
    setKelasAbsensi,
    modePeriode,
    setModePeriode,
    tanggalAktif,
    geserPeriode,
    pilihTanggal,
    muridPerKelas,
    rentangAktif,
    rekapPeriode,
    ringkasanMurid,
    jumlahBelumTercatat,
    filterRiwayatKelas,
    setFilterRiwayatKelas,
    filterRiwayatStatus,
    setFilterRiwayatStatus,
    riwayatSearch,
    setRiwayatSearch,
    setHalamanRiwayat,
    riwayatAbsensiMurid,
    riwayatAbsensiTampil,
    riwayatDitampilkan,
    halamanAktifRiwayat,
    totalHalamanRiwayat,
    absensiTerpilih,
    setAbsensiTerpilih,
    bukaModalKoreksi,
    statusKoreksi,
    setStatusKoreksi,
    isMenyimpanKoreksi,
    handleKoreksiAbsensi,
  }
}
