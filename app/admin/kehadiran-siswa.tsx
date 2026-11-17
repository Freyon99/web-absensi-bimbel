"use client"

import { useEffect, useState, FormEvent } from "react"
import { fetchApi } from "@/lib/api-client"
import { KELAS_OPTIONS } from "@/lib/kelas"

interface MuridRingkas {
  id: string
  namaLengkap: string
  namaPanggilan: string
  kelas: string
}

interface LogAbsensiMurid {
  id: string
  tanggal: string
  status: string
  murid: { id: string; namaLengkap: string; kelas: string }
  guru: { nama: string } | null
}

const STATUS_ABSENSI = [
  {
    value: "HADIR",
    label: "Hadir",
    select: "border-emerald-300 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
  {
    value: "IZIN",
    label: "Izin",
    select: "border-sky-300 text-sky-700",
    badge: "bg-sky-100 text-sky-800",
  },
  {
    value: "SAKIT",
    label: "Sakit",
    select: "border-amber-300 text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  {
    value: "ALPHA",
    label: "Alpha",
    select: "border-rose-300 text-rose-700",
    badge: "bg-rose-100 text-rose-800",
  },
]

const STATUS_BADGE_STYLE = Object.fromEntries(
  STATUS_ABSENSI.map((s) => [s.value, s.badge]),
) as Record<string, string>

const STATUS_LABEL = Object.fromEntries(STATUS_ABSENSI.map((s) => [s.value, s.label])) as Record<
  string,
  string
>

// Tabel riwayat menampilkan 50 baris per halaman supaya render tetap ringan.
const BATCH_RIWAYAT = 50
// Batas maksimal catatan yang dibolehkan server mengembalikan per rentang.
const BATAS_RIWAYAT = 2000

type ModePeriode = "HARIAN" | "MINGGUAN" | "BULANAN"

const MODE_PERIODE_OPTIONS: { value: ModePeriode; label: string }[] = [
  { value: "HARIAN", label: "Harian" },
  { value: "MINGGUAN", label: "Mingguan" },
  { value: "BULANAN", label: "Bulanan" },
]

function formatKelas(kelas: string) {
  return kelas.replaceAll("_", " ")
}

function mulaiHari(d: Date) {
  const hasil = new Date(d)
  hasil.setHours(0, 0, 0, 0)
  return hasil
}

function akhirHari(d: Date) {
  const hasil = new Date(d)
  hasil.setHours(23, 59, 59, 999)
  return hasil
}

// Pekan dimulai hari Senin (konvensi Indonesia).
function mulaiMinggu(d: Date) {
  const hasil = mulaiHari(d)
  const selisih = (hasil.getDay() + 6) % 7
  hasil.setDate(hasil.getDate() - selisih)
  return hasil
}

function akhirMinggu(d: Date) {
  const hasil = mulaiMinggu(d)
  hasil.setDate(hasil.getDate() + 6)
  return akhirHari(hasil)
}

function mulaiBulan(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

function akhirBulan(d: Date) {
  return akhirHari(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

function tambahHari(d: Date, selisih: number) {
  const hasil = new Date(d)
  hasil.setDate(hasil.getDate() + selisih)
  return hasil
}

function tambahBulan(d: Date, selisih: number) {
  const hasil = new Date(d)
  hasil.setMonth(hasil.getMonth() + selisih)
  return hasil
}

function keTanggalISO(d: Date) {
  const bulan = String(d.getMonth() + 1).padStart(2, "0")
  const tanggal = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${bulan}-${tanggal}`
}

function formatRentang(mulai: Date, selesai: Date, mode: ModePeriode) {
  if (mode === "MINGGUAN") {
    const awal = mulai.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    const akhir = selesai.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    return `${awal} – ${akhir}`
  }

  if (mode === "BULANAN") {
    return selesai.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
  }

  return mulai.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function dalamRentang(tanggal: string, mulai: Date, selesai: Date) {
  const d = new Date(tanggal)
  return d >= mulai && d <= selesai
}

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
 * Menu "Absensi Siswa" di halaman admin: rekap + riwayat + koreksi (khusus admin).
 * Pencatatan kehadiran tetap dilakukan guru di /dashboard.
 */
export default function KehadiranSiswa({
  showNotification,
}: {
  showNotification: (title: string, message: string, isSuccess?: boolean) => void
}) {
  const [kelasAbsensi, setKelasAbsensi] = useState("CALISTUNG")
  // Murid diambil khusus untuk kelas yang sedang dibuka, bukan semua murid.
  const [muridPerKelas, setMuridPerKelas] = useState<MuridRingkas[]>([])
  const [modePeriode, setModePeriode] = useState<ModePeriode>("HARIAN")
  const [tanggalAktif, setTanggalAktif] = useState(() => keTanggalISO(new Date()))
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

    setTanggalAktif(keTanggalISO(baru))
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

  const mulaiISO = keTanggalISO(rentangAktif.mulai)
  const selesaiISO = keTanggalISO(rentangAktif.selesai)

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

  const rekapPeriode = STATUS_ABSENSI.map((status) => ({
    ...status,
    jumlah: absensiDalamRentang.filter((item) => item.status === status.value).length,
  }))

  // Ringkasan per murid untuk jangkauan yang dipilih.
  const ringkasanMurid = muridPerKelas.map((murid) => {
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

  return (
    <>
      <div className="space-y-6">
        {/* Rekap kehadiran pada jangkauan yang dipilih */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {rekapPeriode.map((status) => (
            <div
              key={status.value}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-gray-500">{status.label}</p>
              <p className="mt-2 text-3xl font-bold text-[#0F3D8C]">{status.jumlah}</p>
              <p className="mt-1 text-xs text-gray-400">{rentangAktif.label}</p>
            </div>
          ))}
        </div>

        {/* Kehadiran per kelas (hanya baca) */}
        <div className="w-full rounded-2xl bg-white p-6 shadow">
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#0F3D8C]">Absensi Siswa</h3>
              <p className="text-sm text-gray-500">
                Pantau kehadiran murid per hari, pekan, atau bulan. Pencatatan dilakukan oleh guru.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {rentangAktif.label}
                {" · "}
                {muridPerKelas.length} murid
                {jumlahBelumTercatat > 0 ? ` · ${jumlahBelumTercatat} belum tercatat` : ""}
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
              <div className="flex rounded-xl border border-gray-200 p-1">
                {MODE_PERIODE_OPTIONS.map((opsi) => (
                  <button
                    key={opsi.value}
                    type="button"
                    onClick={() => setModePeriode(opsi.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      modePeriode === opsi.value
                        ? "bg-[#D6B25E] text-[#0F3D8C]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opsi.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => geserPeriode(-1)}
                  aria-label="Jangkauan sebelumnya"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={tanggalAktif}
                  onChange={(e) => pilihTanggal(e.target.value)}
                  className="rounded-xl border border-[#D6B25E] bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C]"
                />
                <button
                  type="button"
                  onClick={() => geserPeriode(1)}
                  aria-label="Jangkauan berikutnya"
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModePeriode("HARIAN")
                    setTanggalAktif(keTanggalISO(new Date()))
                  }}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Hari Ini
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {KELAS_OPTIONS.map((kelas) => (
                  <button
                    key={kelas}
                    type="button"
                    onClick={() => setKelasAbsensi(kelas)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      kelasAbsensi === kelas
                        ? "bg-[#D6B25E] text-[#0F3D8C] shadow-sm"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {formatKelas(kelas)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-[#D6B25E] bg-white shadow-inner">
            <table className="w-full min-w-max text-sm table-auto">
              <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Nama Siswa</th>
                  <th className="px-4 py-3 text-left">Panggilan</th>
                  {modePeriode === "HARIAN" ? (
                    <>
                      <th className="px-4 py-3 text-left">Status Kehadiran</th>
                      <th className="px-4 py-3 text-left">Dicatat Oleh</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-left">Hadir</th>
                      <th className="px-4 py-3 text-left">Izin</th>
                      <th className="px-4 py-3 text-left">Sakit</th>
                      <th className="px-4 py-3 text-left">Alpha</th>
                      <th className="px-4 py-3 text-left">% Hadir</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {muridPerKelas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={modePeriode === "HARIAN" ? 5 : 8}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Belum ada murid terdaftar di kelas{" "}
                      {kelasAbsensi ? formatKelas(kelasAbsensi) : "-"}
                    </td>
                  </tr>
                ) : (
                  ringkasanMurid.map((item, index) => (
                    <tr key={item.murid.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.murid.namaLengkap}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.murid.namaPanggilan}</td>

                      {modePeriode === "HARIAN" ? (
                        <>
                          <td className="px-4 py-3">
                            {item.catatan.length > 0 ? (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  STATUS_BADGE_STYLE[item.catatan[0].status] ||
                                  "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {STATUS_LABEL[item.catatan[0].status] || item.catatan[0].status}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Belum tercatat</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div className="flex items-center gap-2">
                              <span>{item.catatan[0]?.guru?.nama || "-"}</span>
                              {item.catatan[0] && (
                                <button
                                  type="button"
                                  onClick={() => bukaModalKoreksi(item.catatan[0])}
                                  className="text-xs font-semibold text-[#0F3D8C] hover:underline"
                                >
                                  Ubah
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-gray-600">{item.hitung.HADIR}</td>
                          <td className="px-4 py-3 text-gray-600">{item.hitung.IZIN}</td>
                          <td className="px-4 py-3 text-gray-600">{item.hitung.SAKIT}</td>
                          <td className="px-4 py-3 text-gray-600">{item.hitung.ALPHA}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {item.persenHadir === null ? "-" : `${item.persenHadir}%`}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Guru yang mencatat kehadiran murid; admin dapat mengoreksi catatan yang salah.
          </p>
        </div>

        {/* Riwayat absensi murid */}
        <div className="w-full rounded-2xl bg-white p-6 shadow">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#0F3D8C]">Riwayat Absensi Siswa</h3>
              <p className="text-sm text-gray-500">
                {rentangAktif.label} · Menampilkan {riwayatAbsensiTampil.length} dari{" "}
                {riwayatAbsensiMurid.length} catatan absensi.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={riwayatSearch}
                onChange={(e) => {
                  setRiwayatSearch(e.target.value)
                  setHalamanRiwayat(1)
                }}
                className="w-full rounded-xl border border-[#D6B25E] bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C] sm:w-56"
              />

              <select
                value={filterRiwayatKelas}
                onChange={(e) => {
                  setFilterRiwayatKelas(e.target.value)
                  setHalamanRiwayat(1)
                }}
                className="w-full rounded-xl border border-[#D6B25E] bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C] sm:w-44"
              >
                <option value="">Semua Kelas</option>
                {KELAS_OPTIONS.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    {formatKelas(kelas)}
                  </option>
                ))}
              </select>

              <select
                value={filterRiwayatStatus}
                onChange={(e) => {
                  setFilterRiwayatStatus(e.target.value)
                  setHalamanRiwayat(1)
                }}
                className="w-full rounded-xl border border-[#D6B25E] bg-white px-4 py-2 text-sm text-gray-900 outline-none focus:border-[#0F3D8C] sm:w-40"
              >
                <option value="">Semua Status</option>
                {STATUS_ABSENSI.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-h-128 w-full overflow-auto rounded-xl border border-[#D6B25E] bg-white shadow-inner">
            <table className="w-full min-w-max text-sm table-auto">
              <thead className="sticky top-0 bg-[#F6E7B5] text-[#0F3D8C]">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Nama Siswa</th>
                  <th className="px-4 py-3 text-left">Kelas</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Dicatat Oleh</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {riwayatAbsensiTampil.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Belum ada catatan absensi yang cocok
                    </td>
                  </tr>
                ) : (
                  riwayatDitampilkan.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        {" · "}
                        {new Date(item.tanggal).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.murid.namaLengkap}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatKelas(item.murid.kelas)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            STATUS_BADGE_STYLE[item.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STATUS_LABEL[item.status] || item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.guru?.nama || "Pengguna Terhapus"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => bukaModalKoreksi(item)}
                          className="text-xs font-semibold text-[#0F3D8C] hover:underline"
                        >
                          Ubah Status
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {riwayatAbsensiMurid.length >= BATAS_RIWAYAT && (
            <p className="mt-2 text-xs font-semibold text-amber-600">
              Baru menampilkan {BATAS_RIWAYAT} catatan terbaru. Persempit rentang tanggal atau
              tambah filter untuk hasil yang lebih sedikit.
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>
              Menampilkan {riwayatDitampilkan.length} dari {riwayatAbsensiTampil.length} catatan
            </span>
            {halamanAktifRiwayat < totalHalamanRiwayat && (
              <button
                type="button"
                onClick={() => setHalamanRiwayat((halaman) => halaman + 1)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Muat lebih banyak
              </button>
            )}
          </div>
        </div>
      </div>

      {/* POP-UP MODAL: KOREKSI ABSENSI SISWA (KHUSUS ADMIN) */}
      {absensiTerpilih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <form
            onSubmit={handleKoreksiAbsensi}
            className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl text-gray-900 border"
          >
            <h3 className="text-xl font-bold text-[#0F3D8C]">Koreksi Absensi Siswa</h3>

            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-800">
                  {absensiTerpilih.murid.namaLengkap}
                </span>
                {" · "}
                {formatKelas(absensiTerpilih.murid.kelas)}
              </p>
              <p className="mt-1">
                {new Date(absensiTerpilih.tanggal).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                Dicatat oleh {absensiTerpilih.guru?.nama || "Pengguna Terhapus"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">
                Status Kehadiran
              </label>
              <select
                value={statusKoreksi}
                onChange={(e) => setStatusKoreksi(e.target.value)}
                className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]"
              >
                {STATUS_ABSENSI.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAbsensiTerpilih(null)}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isMenyimpanKoreksi}
                className="flex-1 rounded-xl bg-[#0F3D8C] py-2.5 font-semibold text-white hover:bg-[#0B2E69] disabled:bg-gray-400"
              >
                {isMenyimpanKoreksi ? "Menyimpan..." : "Simpan Koreksi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
