"use client";

import { useState } from "react";
import Link from "next/link";

const menuList = [
  "Data Siswa",
  "Data Guru",
  "Absensi Guru",
  "Statistik Siswa",
  "Statistik Guru",
];

export default function AdminPage() {
  const [menuAktif, setMenuAktif] = useState("Data Kelas");

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow">
        <h1 className="text-xl font-bold text-[#0F3D8C]">
          Admin Aksara Bimbel
        </h1>

        <div className="flex items-center gap-4">
          <select className="rounded-lg border border-[#D6B25E] px-3 py-2 text-sm text-gray-500 outline-none">
            <option>Admin</option>
            <option>Change Password</option>
            <option>Change Email</option>
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
          <h2 className="mb-4 text-lg font-bold">Menu Admin</h2>

          <div className="space-y-2">
            {menuList.map((menu) => (
              <button
                key={menu}
                onClick={() => setMenuAktif(menu)}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  menuAktif === menu
                    ? "bg-[#D6B25E] text-[#0F3D8C]"
                    : "hover:bg-[#1B4FA3]"
                }`}
              >
                {menu}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8">
          <h2 className="mb-6 text-3xl font-bold text-[#0F3D8C]">
            {menuAktif}
          </h2>

          {menuAktif === "Data Siswa" && <DataSiswa />}
          {menuAktif === "Data Guru" && <DataGuru />}
          {menuAktif === "Absensi Guru" && <AbsensiGuru />}
          {menuAktif === "Statistik Siswa" && <StatistikSiswa />}
          {menuAktif === "Statistik Guru" && <StatistikGuru />}
        </main>
      </div>
    </div>
  );
}

function DataSiswa() {
  const [filterKelas, setFilterKelas] = useState("");
  const [filterHari, setFilterHari] = useState("");
  const [filterJam, setFilterJam] = useState("");

  const siswa = [
    {
      tanggalMasuk: "2025-07-15",
      nama: "Alya Putri",
      panggilan: "Alya",
      kelas: "SD 2",
      sekolah: "SDN Mekarjaya",
      orangtua: "Bapak Rudi / Ibu Sari",
      pekerjaanAyah: "Karyawan",
      pekerjaanIbu: "Ibu Rumah Tangga",
      alamat: "Jl. Melati No. 10, Bandung",
      noHp: "081234567890",
      hari: "Senin",
      jam: "15.00",
      pembayaran: "Bulanan",
      mapel: "Semua Mapel",
      catatan: "Perlu dibimbing membaca.",
    },
  ];

  const filteredSiswa = siswa.filter((item) => {
    const cocokKelas = filterKelas ? item.kelas === filterKelas : true;
    const cocokHari = filterHari ? item.hari === filterHari : true;
    const cocokJam = filterJam ? item.jam === filterJam : true;

    return cocokKelas && cocokHari && cocokJam;
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#0F3D8C]">Data Siswa</h3>
          <p className="text-sm text-gray-500">
            Daftar peserta didik Aksara Bimbel.
          </p>
        </div>

        <button className="rounded-xl bg-[#0F3D8C] px-5 py-2 font-semibold text-white hover:bg-[#0B2E69]">
          Tambah Siswa
        </button>
      </div>

      {/* Filter */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
            Pilih Kelas
          </label>
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 text-gray-500 outline-none focus:border-[#0F3D8C]"
          >
            <option value="">Semua Kelas</option>
            <option value="Calistung">Calistung</option>
            <option value="SD 1">SD 1</option>
            <option value="SD 2">SD 2</option>
            <option value="SD 3">SD 3</option>
            <option value="SD 4">SD 4</option>
            <option value="SD 5">SD 5</option>
            <option value="SD 6">SD 6</option>
            <option value="SMP 1">SMP 1</option>
            <option value="SMP 2">SMP 2</option>
            <option value="SMP 3">SMP 3</option>
            <option value="SMK 1">SMK 1</option>
            <option value="SMK 2">SMK 2</option>
            <option value="SMK 3">SMK 3</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
            Pilih Hari
          </label>
          <select
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 text-gray-500 outline-none focus:border-[#0F3D8C]"
          >
            <option value="">Semua Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
            Pilih Jam Les
          </label>
          <select
            value={filterJam}
            onChange={(e) => setFilterJam(e.target.value)}
            className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 text-gray-500 outline-none focus:border-[#0F3D8C]"
          >
            <option value="">Semua Jam</option>
            <option value="09.00">09.00</option>
            <option value="10.00">10.00</option>
            <option value="11.00">11.00</option>
            <option value="15.00">15.00</option>
            <option value="16.00">16.00</option>
            <option value="17.00">17.00</option>
            <option value="18.30">18.30</option>
            <option value="19.30">19.30</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-xl border border-[#D6B25E]">
        <table className="w-full min-w-450">
          <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Tanggal Masuk</th>
              <th className="px-4 py-3 text-left">Nama Lengkap</th>
              <th className="px-4 py-3 text-left">Nama Panggilan</th>
              <th className="px-4 py-3 text-left">Kelas</th>
              <th className="px-4 py-3 text-left">Sekolah Asal</th>
              <th className="px-4 py-3 text-left">Nama Ayah & Ibu/Wali</th>
              <th className="px-4 py-3 text-left">Pekerjaan Ayah</th>
              <th className="px-4 py-3 text-left">Pekerjaan Ibu</th>
              <th className="px-4 py-3 text-left">Alamat Domisili</th>
              <th className="px-4 py-3 text-left">No HP OrangTua/Wali</th>
              <th className="px-4 py-3 text-left">Hari</th>
              <th className="px-4 py-3 text-left">Jam</th>
              <th className="px-4 py-3 text-left">Pembayaran</th>
              <th className="px-4 py-3 text-left">Mapel</th>
              <th className="px-4 py-3 text-left">Catatan Anak</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredSiswa.map((item, index) => (
              <tr key={item.nama} className="border-t">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 text-gray-600">{item.tanggalMasuk}</td>
                <td className="px-4 py-3 font-medium text-gray-700">
                  {item.nama}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.panggilan}</td>
                <td className="px-4 py-3 text-gray-600">{item.kelas}</td>
                <td className="px-4 py-3 text-gray-600">{item.sekolah}</td>
                <td className="px-4 py-3 text-gray-600">{item.orangtua}</td>
                <td className="px-4 py-3 text-gray-600">
                  {item.pekerjaanAyah}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.pekerjaanIbu}</td>
                <td className="px-4 py-3 text-gray-600">{item.alamat}</td>
                <td className="px-4 py-3 text-gray-600">{item.noHp}</td>
                <td className="px-4 py-3 text-gray-600">{item.hari}</td>
                <td className="px-4 py-3 text-gray-600">{item.jam}</td>
                <td className="px-4 py-3 text-gray-600">{item.pembayaran}</td>
                <td className="px-4 py-3 text-gray-600">{item.mapel}</td>
                <td className="px-4 py-3 text-gray-600">{item.catatan}</td>
                <td className="px-4 py-3">
                  <button className="mr-2 text-blue-600 hover:underline">
                    Detail
                  </button>
                  <button className="mr-2 text-yellow-600 hover:underline">
                    Edit
                  </button>
                  <button className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredSiswa.length === 0 && (
              <tr>
                <td
                  colSpan={17}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Data siswa tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataGuru() {
  const guru = [
    {
      nama: "Camila Tasya",
      noHp: "081234567890",
      email: "tasya@gmail.com",
    },
    {
      nama: "Bu Dina",
      noHp: "082233445566",
      email: "dina@gmail.com",
    },
    {
      nama: "Pak Andi",
      noHp: "083344556677",
      email: "andi@gmail.com",
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#0F3D8C]">Data Guru</h3>

          <p className="text-sm text-gray-500">
            Daftar pengajar Aksara Bimbel.
          </p>
        </div>

        <button className="rounded-xl bg-[#0F3D8C] px-5 py-2 font-semibold text-white hover:bg-[#0B2E69]">
          Tambah Guru
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#D6B25E]">
        <table className="w-full min-w-175">
          <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
            <tr>
              <th className="px-4 py-3 text-left">No</th>
              <th className="px-4 py-3 text-left">Nama Guru</th>
              <th className="px-4 py-3 text-left">No HP</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {guru.map((item, index) => (
              <tr key={item.email} className="border-t">
                <td className="px-4 py-3 text-gray-600">{index + 1}</td>

                <td className="px-4 py-3 font-medium text-gray-700">
                  {item.nama}
                </td>

                <td className="px-4 py-3 text-gray-600">{item.noHp}</td>

                <td className="px-4 py-3 text-gray-600">{item.email}</td>

                <td className="px-4 py-3">
                  <button className="mr-3 text-blue-600 hover:underline">
                    Detail
                  </button>

                  <button className="mr-3 text-yellow-600 hover:underline">
                    Edit
                  </button>

                  <button className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {guru.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Data guru belum tersedia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AbsensiGuru() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#D6B25E]">
      <table className="w-full min-w-175">
        <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
          <tr>
            <th className="px-4 py-3 text-left">Nama Guru</th>
            <th className="px-4 py-3 text-left">Tanggal</th>
            <th className="px-4 py-3 text-left">Sesi</th>
            <th className="px-4 py-3 text-left">Jam Datang</th>
            <th className="px-4 py-3 text-left">Jam Pulang</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t">
            <td className="px-4 py-3 text-gray-700">Tasya</td>
            <td className="px-4 py-3 text-gray-600">15 Mei 2026</td>
            <td className="px-4 py-3 text-gray-600">Pagi</td>
            <td className="px-4 py-3 text-gray-600">08:00:12</td>
            <td className="px-4 py-3 text-gray-600">11:30:45</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function StatistikSiswa() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <p className="text-gray-500">
        Statistik kehadiran siswa akan tampil di sini.
      </p>
    </div>
  );
}

function StatistikGuru() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <p className="text-gray-500">
        Statistik kehadiran guru akan tampil di sini.
      </p>
    </div>
  );
}
