"use client";

import { useState } from "react";
import Link from "next/link";

const kelasList = [
  "Calistung",
  "SD 1",
  "SD 2",
  "SD 3",
  "SD 4",
  "SD 5",
  "SD 6",
  "SMP 1",
  "SMP 2",
  "SMP 3",
  "SMK 1",
  "SMK 2",
  "SMK 3",
];

const siswaList = [
  "Alya Putri",
  "Bima Pratama",
  "Citra Lestari",
  "Daffa Ramadhan",
  "Nabila Zahra",
];

export default function DashboardPage() {
  const [menuAktif, setMenuAktif] = useState("Absensi Guru");
  const [kelasAktif, setKelasAktif] = useState("Calistung");
  const [showKelas, setShowKelas] = useState(false);
  const [absen, setAbsen] = useState<Record<string, string>>({});

  const namaGuru = "Tasya";

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow">
        <h1 className="text-xl font-bold text-[#0F3D8C]">Aksara Bimbel</h1>

        <div className="flex items-center gap-4">
          <select className="rounded-lg border border-[#D6B25E] px-3 py-2 text-sm text-gray-500 outline-none">
            <option>{namaGuru}</option>
            <option>Setelan</option>
          </select>

          <Link
            href="/"
            className="rounded-lg bg-[#0F3D8C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B2E69]"
          >
            Keluar
          </Link>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-[calc(100vh-72px)] w-64 bg-[#0F3D8C] p-5 text-white">
          <h2 className="mb-4 text-lg font-bold">Menu Guru</h2>

          <div className="space-y-2">
            <button
              onClick={() => setMenuAktif("Absensi Guru")}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${
                menuAktif === "Absensi Guru"
                  ? "bg-[#D6B25E] text-[#0F3D8C]"
                  : "hover:bg-[#1B4FA3]"
              }`}
            >
              Absensi Guru
            </button>

            <button
              onClick={() => setShowKelas(!showKelas)}
              className="w-full rounded-xl px-4 py-3 text-left transition hover:bg-[#1B4FA3]"
            >
              Pilihan Kelas {showKelas ? "▲" : "▼"}
            </button>

            {showKelas && (
              <div className="ml-3 space-y-2">
                {kelasList.map((kelas) => (
                  <button
                    key={kelas}
                    onClick={() => {
                      setKelasAktif(kelas);
                      setMenuAktif("Absensi Siswa");
                    }}
                    className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
                      menuAktif === "Absensi Siswa" && kelasAktif === kelas
                        ? "bg-[#D6B25E] text-[#0F3D8C]"
                        : "hover:bg-[#1B4FA3]"
                    }`}
                  >
                    {kelas}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8">
          {menuAktif === "Absensi Guru" && <AbsensiGuru namaGuru={namaGuru} />}

          {menuAktif === "Absensi Siswa" && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#0F3D8C]">
                  Absensi Kelas {kelasAktif}
                </h2>
                <p className="mt-1 text-gray-500">
                  Pengajar: <span className="font-semibold">{namaGuru}</span>
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                <table className="w-full">
                  <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                    <tr>
                      <th className="px-5 py-4 text-left">No</th>
                      <th className="px-5 py-4 text-left">Nama Siswa</th>
                      <th className="px-5 py-4 text-left">Status</th>
                      <th className="px-5 py-4 text-left">Pengajar</th>
                    </tr>
                  </thead>

                  <tbody>
                    {siswaList.map((siswa, index) => (
                      <tr key={siswa} className="border-t">
                        <td className="px-5 py-4 text-gray-600">{index + 1}</td>

                        <td className="px-5 py-4 font-medium text-gray-700">
                          {siswa}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={absen[siswa] || "Alpha"}
                            onChange={(e) =>
                              setAbsen({
                                ...absen,
                                [siswa]: e.target.value,
                              })
                            }
                            className="rounded-lg border border-[#D6B25E] px-3 py-2 text-gray-500 outline-none"
                          >
                            <option value="Hadir">Hadir</option>
                            <option value="Izin">Izin</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Alpha">Alpha</option>
                          </select>
                        </td>

                        <td className="px-5 py-4 text-gray-600">{namaGuru}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="mt-6 rounded-xl bg-[#0F3D8C] px-6 py-3 font-semibold text-white hover:bg-[#0B2E69]">
                Simpan Absensi
              </button>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function AbsensiGuru({ namaGuru }: { namaGuru: string }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#0F3D8C]">Absensi Guru</h2>
        <p className="mt-1 text-gray-500">
          Catat kehadiran datang dan pulang pengajar.
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <button className="rounded-xl bg-[#0F3D8C] px-6 py-3 font-semibold text-white hover:bg-[#0B2E69]">
          Absen Datang
        </button>

        <button className="rounded-xl bg-[#D6B25E] px-6 py-3 font-semibold text-[#0F3D8C] hover:bg-[#c7a34e]">
          Absen Pulang
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <table className="w-full">
          <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">Nama Guru</th>
              <th className="px-4 py-3 text-left">Sesi</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Jam Datang</th>
              <th className="px-4 py-3 text-left">Jam Pulang</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3 text-gray-700">{namaGuru}</td>
              <td className="px-4 py-3 text-gray-600">Pagi</td>
              <td className="px-4 py-3 text-gray-600">16 Mei 2026</td>
              <td className="px-4 py-3 text-gray-600">08:00:12</td>
              <td className="px-4 py-3 text-gray-600">11:30:45</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
