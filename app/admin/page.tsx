"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

interface UserProfile {
  id: string;
  nama: string;
  email: string;
  peran: string;
  noHp?: string; // Tambahkan properti opsional noHp
}

interface Murid {
  id: string;
  tanggalMasuk: string;
  namaLengkap: string;
  namaPanggilan: string;
  kelas: string;
  sekolahAsal: string;
  namaOrangTuaWali: string;
  pekerjaanAyah: string;
  pekerjaanIbu: string;
  alamatDomisili: string;
  noHpOrangTua: string;
  hari: string;
  jam: string;
  pembayaran: string;
  mapel: string;
  catatanAnak: string | null;
}

interface LogAbsenGuru {
  id: string;
  waktuMasuk: string;
  waktuPulang: string | null;
  guru: { nama: string };
}

export default function AdminPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { showNotification, showConfirmLogout, setIsLoadingGlobal } = useNotification();

  const [menuAktif, setMenuAktif] = useState("Data Siswa");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [siswaList, setSiswaList] = useState<Murid[]>([]);
  const [guruList, setGuruList] = useState<UserProfile[]>([]);
  const [absenGuruList, setAbsenGuruList] = useState<LogAbsenGuru[]>([]);

  const [modalType, setModalType] = useState<"tambahGuru" | "tambahSiswa" | "editSiswa" | "detailSiswa" | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<Murid | null>(null);
  const [selectedGuru, setSelectedGuru] = useState<UserProfile | null>(null); // Tambahkan state guru terpilih

  const [formGuru, setFormGuru] = useState({ nama: "", email: "", password: "", noHp: "" }); // SINKRON: Tambah noHp
  const [formSiswa, setFormSiswa] = useState({
    namaLengkap: "", namaPanggilan: "", kelas: "Calistung", sekolahAsal: "",
    namaOrangTuaWali: "", pekerjaanAyah: "", pekerjaanIbu: "", alamatDomisili: "",
    noHpOrangTua: "", hari: "", jam: "", pembayaran: "BELUM LUNAS", mapel: "", catatanAnak: "", 
  });

  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoadingGlobal(true);
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");
      
      if (!savedToken || !savedUser) { 
        router.push("/"); 
        setIsLoadingGlobal(false);
        return; 
      }
      
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.peran !== "ADMIN") { 
        router.push("/dashboard"); 
        setIsLoadingGlobal(false);
        return; 
      }
      
      setUser(parsedUser);
      await Promise.all([fetchDataSiswa(), fetchDataGuru(), fetchAbsensiGuru()]);
      setIsLoadingGlobal(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDataSiswa = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/murid", { headers: { "Authorization": `Bearer ${token}` } });
    if (res.ok) setSiswaList(await res.json());
  };

  const fetchDataGuru = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/users", { headers: { "Authorization": `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setGuruList(data.filter((u: UserProfile) => u.peran === "GURU"));
    }
  };

  const fetchAbsensiGuru = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/absensi-guru", { headers: { "Authorization": `Bearer ${token}` } });
    if (res.ok) setAbsenGuruList(await res.json());
  };

  const handleTambahGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenAdmin = localStorage.getItem("token");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formGuru, peran: "GURU" }),
    });
    if (res.ok) {
      localStorage.setItem("token", tokenAdmin!); 
      showNotification("Sukses", "Akun Guru baru berhasil didaftarkan!", true);
      setModalType(null);
      setFormGuru({ nama: "", email: "", password: "", noHp: "" });
      fetchDataGuru();
    } else {
      const d = await res.json();
      showNotification("Gagal", d.message || "Gagal menambah guru", false);
    }
  };
    // 1. Fungsi untuk membuka modal edit dan mengisi form dengan data guru yang dipilih
  const openEditGuruModal = (guru: UserProfile) => {
    setSelectedGuru(guru);
    setFormGuru({
      nama: guru.nama,
      email: guru.email,
      password: "", // Sengaja dikosongkan, diisi hanya jika ingin ganti password
      noHp: guru.noHp || "",
    });
    setModalType("editGuru" as any); // Memicu modal edit guru muncul
  };

  // 2. Fungsi untuk mengirim data perubahan guru ke API backend (PUT)
  const handleEditGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuru) return;
    
    const token = localStorage.getItem("token");
    setIsLoadingGlobal(true);

    try {
      const res = await fetch(`/api/users/${selectedGuru.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formGuru), // Mengirim nama, email, noHp, dan password jika diisi
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Sukses", "Data informasi pengajar berhasil diperbarui!", true);
        setModalType(null);
        fetchDataGuru(); // Refresh tabel guru
      } else {
        showNotification("Gagal", data.message || "Gagal memperbarui data guru", false);
      }
    } catch (error) {
      showNotification("Error", "Terjadi kesalahan jaringan", false);
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const handleTambahSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/murid", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formSiswa),
    });
    if (res.ok) {
      showNotification("Sukses", "Data siswa baru berhasil ditambahkan!", true);
      setModalType(null);
      fetchDataSiswa();
    } else {
      showNotification("Gagal", "Gagal menambahkan siswa.", false);
    }
  };

  const handleEditSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswa) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/murid/${selectedSiswa.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formSiswa),
    });
    if (res.ok) {
      showNotification("Sukses", "Data siswa berhasil diperbarui!", true);
      setModalType(null);
      fetchDataSiswa();
    } else {
      showNotification("Gagal", "Gagal memperbarui data siswa.", false);
    }
  };

  const handleHapusSiswa = async (id: string, nama: string) => {
    showConfirmLogout(
      "Hapus Data Murid?",
      `Apakah Anda yakin ingin menghapus data murid ${nama}? Riwayat absensinya juga akan ikut terhapus.`,
      async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/murid/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          showNotification("Terhapus", "Data murid telah dihapus dari sistem.", true);
          fetchDataSiswa();
        } else {
          showNotification("Gagal", "Gagal menghapus data murid.", false);
        }
      }
    );
  };

  const openEditModal = (siswa: Murid) => {
    setSelectedSiswa(siswa);
    setFormSiswa({
      namaLengkap: siswa.namaLengkap, namaPanggilan: siswa.namaPanggilan, kelas: siswa.kelas, sekolahAsal: siswa.sekolahAsal,
      namaOrangTuaWali: siswa.namaOrangTuaWali, pekerjaanAyah: siswa.pekerjaanAyah, pekerjaanIbu: siswa.pekerjaanIbu,
      alamatDomisili: siswa.alamatDomisili, noHpOrangTua: siswa.noHpOrangTua, hari: siswa.hari, jam: siswa.jam,
      pembayaran: siswa.pembayaran, mapel: siswa.mapel, catatanAnak: siswa.catatanAnak || ""
    });
    setModalType("editSiswa");
  };

  const openDetailModal = (siswa: Murid) => {
    setSelectedSiswa(siswa);
    setModalType("detailSiswa");
  };

  const triggerLogoutValidation = () => {
    setShowProfileMenu(false);
    showConfirmLogout("Konfirmasi Keluar", "Apakah Anda yakin ingin keluar dari sistem Admin Aksara Bimbel?", executeLogout);
  };

  const executeLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.reload();
  };

  const filteredSiswa = siswaList.filter((s) => s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!user) return null;
  return (
    <div className="min-h-screen max-w-full flex flex-col bg-[#FFFDF8] overflow-hidden text-gray-900">
      {/* Navbar Atas */}
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow relative z-20 shrink-0">
        <h1 className="text-xl font-bold text-[#0F3D8C]">Aksara Bimbel (Admin)</h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block rounded-lg border border-[#D6B25E] px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50">{user.nama}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F3D8C] text-white shadow-md transition hover:bg-[#0B2E69] active:scale-95">
              <span className="font-semibold uppercase">{user.nama.charAt(0)}</span>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-2xl border border-gray-100 z-50">
                <div className="border-b border-gray-100 px-3 py-2 text-left">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.nama}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.peran.toLowerCase()}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    showNotification("Informasi Sistem", "Fitur pengaturan profil admin segera hadir!", true);
                  }}
                  className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </button>
                <button onClick={triggerLogoutValidation} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Konten Utama Layout Dinamik */}
      <div className="flex w-full max-w-full min-h-[calc(100vh-72px)] overflow-hidden">
        <aside className="w-64 bg-[#0F3D8C] p-5 text-white shrink-0 min-h-full">
          <h2 className="mb-4 text-lg font-bold">Menu Admin</h2>
          <div className="space-y-2">
            {["Data Siswa", "Data Guru", "Absensi Guru", "Statistik Siswa", "Statistik Guru"].map((menu) => (
              <button key={menu} onClick={() => setMenuAktif(menu)} className={`w-full rounded-xl px-4 py-3 text-left transition ${menuAktif === menu ? "bg-[#D6B25E] text-[#0F3D8C]" : "hover:bg-[#1B4FA3]"}`}>{menu}</button>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-8 bg-[#FFFDF8] overflow-y-auto">
          {/* MENU 1: DATA SISWA */}
          {menuAktif === "Data Siswa" && (
            <div className="rounded-2xl bg-white p-6 shadow w-full">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#0F3D8C]">Data Siswa</h3>
                  <p className="text-sm text-gray-500">Kelola dan pantau seluruh murid master Aksara Bimbel.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" placeholder="Cari nama siswa..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-xl border border-[#D6B25E] px-4 py-2 text-sm text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
                  <button 
                    onClick={() => { 
                      setFormSiswa({
                        namaLengkap: "", namaPanggilan: "", kelas: "Calistung", sekolahAsal: "",
                        namaOrangTuaWali: "", pekerjaanAyah: "", pekerjaanIbu: "", alamatDomisili: "",
                        noHpOrangTua: "", hari: "", jam: "", pembayaran: "BELUM LUNAS", mapel: "", catatanAnak: ""
                      }); 
                      setModalType("tambahSiswa"); 
                    }} 
                    className="rounded-xl bg-[#0F3D8C] px-5 py-2 font-semibold text-white hover:bg-[#0B2E69] whitespace-nowrap"
                  >
                    Tambah Siswa
                  </button>
                </div>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-[#D6B25E] bg-white shadow-inner">
                <table className="w-full min-w-max text-sm table-auto">
                  <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                    <tr>
                      <th className="px-4 py-3 text-left">No</th>
                      <th className="px-4 py-3 text-left">Tanggal Masuk</th>
                      <th className="px-4 py-3 text-left">Nama Lengkap</th>
                      <th className="px-4 py-3 text-left">Panggilan</th>
                      <th className="px-4 py-3 text-left">Kelas</th>
                      <th className="px-4 py-3 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSiswa.map((item, index) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(item.tanggalMasuk).toLocaleDateString("id-ID")}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{item.namaLengkap}</td>
                        <td className="px-4 py-3 text-gray-600">{item.namaPanggilan}</td>
                        <td className="px-4 py-3 text-gray-600">{item.kelas}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button onClick={() => openDetailModal(item)} className="mr-2 text-blue-600 hover:underline">Detail</button>
                          <button onClick={() => openEditModal(item)} className="mr-2 text-yellow-600 hover:underline">Edit</button>
                          <button onClick={() => handleHapusSiswa(item.id, item.namaLengkap)} className="text-red-500 hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MENU 2: DATA GURU (SINKRON REFERENSI GAMBAR) */}
          {menuAktif === "Data Guru" && (
            <div className="rounded-2xl bg-white p-6 shadow w-full">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#0F3D8C]">Data Guru</h3>
                  <p className="text-sm text-gray-500">Daftar pengajar Aksara Bimbel.</p>
                </div>
                <button 
                  onClick={() => {
                    setFormGuru({ nama: "", email: "", password: "", noHp: "" });
                    setModalType("tambahGuru");
                  }} 
                  className="rounded-xl bg-[#0F3D8C] px-5 py-2 font-semibold text-white hover:bg-[#0B2E69]"
                >
                  Tambah Guru
                </button>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-[#D6B25E] bg-white shadow-inner">
                <table className="w-full min-w-max text-sm table-auto">
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
                    {guruList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada data pengajar terdaftar</td>
                      </tr>
                    ) : (
                      guruList.map((item, index) => (
                        <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{item.nama}</td>
                          <td className="px-4 py-3 text-gray-600">{item.noHp || "-"}</td>
                          <td className="px-4 py-3 text-gray-600">{item.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button 
                              onClick={() => {
                                showNotification("Profil Pengajar", `Nama: ${item.nama}\nNo HP: ${item.noHp || '-'}\nEmail: ${item.email}`, true);
                              }} 
                              className="mr-2 text-blue-600 hover:underline"
                            >
                              Detail
                            </button>
                            <button 
                              onClick={() =>  openEditGuruModal(item)} 
                              className="mr-2 text-yellow-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                showConfirmLogout("Hapus Akun Pengajar?", `Hapus permanen akun milik ${item.nama}?`, async () => {
                                  const token = localStorage.getItem("token");
                                  const res = await fetch(`/api/users/${item.id}`, {
                                    method: "DELETE",
                                    headers: { "Authorization": `Bearer ${token}` }
                                  });
                                  if (res.ok) {
                                    showNotification("Terhapus", "Akun pengajar berhasil dihapus.", true);
                                    fetchDataGuru();
                                  }
                                });
                              }} 
                              className="text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MENU 3: ABSENSI GURU */}
          {menuAktif === "Absensi Guru" && (
            <div className="rounded-2xl bg-white p-6 shadow w-full">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-[#0F3D8C]">Monitoring Absensi Guru</h3>
                <p className="text-sm text-gray-500">Log kehadiran jam datang dan jam pulang seluruh tim pengajar.</p>
              </div>
              <div className="w-full overflow-x-auto rounded-xl border border-[#D6B25E] bg-white">
                <table className="w-full min-w-max text-sm table-auto">
                  <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                    <tr>
                      <th className="px-4 py-3 text-left">Nama Guru</th>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jam Datang</th>
                      <th className="px-4 py-3 text-left">Jam Pulang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absenGuruList.map((item) => {
                      const dateObjMasuk = new Date(item.waktuMasuk);
                      const dateObjPulang = item.waktuPulang ? new Date(item.waktuPulang) : null;
                      return (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-3 text-gray-700 font-semibold">{item.guru?.nama || "Guru Terhapus"}</td>
                          <td className="px-4 py-3 text-gray-600">{dateObjMasuk.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                          <td className="px-4 py-3 text-gray-600 font-bold">{dateObjMasuk.toLocaleTimeString("id-ID")}</td>
                          <td className="px-4 py-3 text-gray-600 font-bold">
                            {dateObjPulang ? dateObjPulang.toLocaleTimeString("id-ID") : "Belum Absen Pulang"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MENU 4 & 5: REKAP STATISTIK */}
          {menuAktif === "Statistik Siswa" && (
            <div className="p-6 bg-white rounded-2xl border border-gray-100 text-gray-800">
              <h4 className="text-lg font-bold text-[#0F3D8C] mb-2">Statistik Murid</h4>
              <p className="text-sm text-gray-500">Total Siswa Terdaftar: <span className="font-bold text-gray-900">{siswaList.length} Anak</span></p>
            </div>
          )}
          {menuAktif === "Statistik Guru" && (
            <div className="p-6 bg-white rounded-2xl border border-gray-100 text-gray-800">
              <h4 className="text-lg font-bold text-[#0F3D8C] mb-2">Statistik Pengajar</h4>
              <p className="text-sm text-gray-500">Total Guru Bimbel: <span className="font-bold text-gray-900">{guruList.length} Orang</span></p>
            </div>
          )}
        </main>
      </div>
      {/* POP-UP MODAL 1: FORM TAMBAH GURU + INPUT NO HP */}
      {modalType === "tambahGuru" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <form onSubmit={handleTambahGuru} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-gray-900 border">
            <h3 className="text-xl font-bold text-[#0F3D8C]">Daftarkan Guru Baru</h3>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">Nama Pengajar</label>
              <input type="text" required value={formGuru.nama} onChange={(e) => setFormGuru({...formGuru, nama: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">No HP Kontak</label>
              <input type="text" required placeholder="Contoh: 081234567890" value={formGuru.noHp} onChange={(e) => setFormGuru({...formGuru, noHp: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">Email</label>
              <input type="email" required value={formGuru.email} onChange={(e) => setFormGuru({...formGuru, email: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">Password Aplikasi</label>
              <input type="password" required value={formGuru.password} onChange={(e) => setFormGuru({...formGuru, password: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalType(null)} className="flex-1 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-700 hover:bg-gray-200">Batal</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#0F3D8C] py-2.5 font-semibold text-white hover:bg-[#0B2E69]">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* POP-UP MODAL 2: FORM INPUT & EDIT DATA SISWA */}
      {(modalType === "tambahSiswa" || modalType === "editSiswa") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
          <form onSubmit={modalType === "tambahSiswa" ? handleTambahSiswa : handleEditSiswa} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900 border">
            <h3 className="text-xl font-bold text-[#0F3D8C] col-span-full">{modalType === "tambahSiswa" ? "Tambah Siswa Baru" : "Edit Informasi Murid"}</h3>
            
            <div><label className="text-xs font-bold text-gray-700 block mb-1">Nama Lengkap</label><input type="text" required value={formSiswa.namaLengkap} onChange={(e) => setFormSiswa({...formSiswa, namaLengkap: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            <div><label className="text-xs font-bold text-gray-700 block mb-1">Nama Panggilan</label><input type="text" required value={formSiswa.namaPanggilan} onChange={(e) => setFormSiswa({...formSiswa, namaPanggilan: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Kelas Tingkat</label>
              <select value={formSiswa.kelas} onChange={(e) => setFormSiswa({...formSiswa, kelas: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]">
                {['Calistung', 'SD 1', 'SD 2', 'SD 3', 'SD 4', 'SD 5', 'SD 6', 'SMP 1', 'SMP 2', 'SMP 3', 'SMK 1'].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-bold text-gray-700 block mb-1">Sekolah Asal</label><input type="text" required value={formSiswa.sekolahAsal} onChange={(e) => setFormSiswa({...formSiswa, sekolahAsal: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            <div><label className="text-xs font-bold text-gray-700 block mb-1">Nama Orang Tua/Wali</label><input type="text" required value={formSiswa.namaOrangTuaWali} onChange={(e) => setFormSiswa({...formSiswa, namaOrangTuaWali: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            <div><label className="text-xs font-bold text-gray-700 block mb-1">No HP Kontak</label><input type="text" required value={formSiswa.noHpOrangTua} onChange={(e) => setFormSiswa({...formSiswa, noHpOrangTua: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            <div><label className="text-xs font-bold text-gray-700 block mb-1">Hari Les</label><input type="text" placeholder="Senin, Rabu" required value={formSiswa.hari} onChange={(e) => setFormSiswa({...formSiswa, hari: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            <div><label className="text-xs font-bold text-gray-700 block mb-1">Jam Les</label><input type="text" placeholder="14:00 - 16:00" required value={formSiswa.jam} onChange={(e) => setFormSiswa({...formSiswa, jam: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            <div><label className="text-xs font-bold text-gray-700 block mb-1">Mata Pelajaran</label><input type="text" placeholder="Matematika, IPA" required value={formSiswa.mapel} onChange={(e) => setFormSiswa({...formSiswa, mapel: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Status Pembayaran</label>
              <select value={formSiswa.pembayaran} onChange={(e) => setFormSiswa({...formSiswa, pembayaran: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]">
                <option value="LUNAS">LUNAS</option>
                <option value="BELUM LUNAS">BELUM LUNAS</option>
              </select>
            </div>

            <div className="col-span-full space-y-2">
              <div><label className="text-xs font-bold text-gray-700 block mb-1">Alamat Domisili</label><textarea required value={formSiswa.alamatDomisili} onChange={(e) => setFormSiswa({...formSiswa, alamatDomisili: e.target.value})} className="w-full rounded-lg border p-2 h-16 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
              <div><label className="text-xs font-bold text-gray-700 block mb-1">Catatan Kondisi Anak (Opsional)</label><input type="text" value={formSiswa.catatanAnak || ""} onChange={(e) => setFormSiswa({...formSiswa, catatanAnak: e.target.value})} className="w-full rounded-lg border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" /></div>
            </div>

            <div className="col-span-full flex gap-3 pt-2">
              <button type="button" onClick={() => setModalType(null)} className="flex-1 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-700 hover:bg-gray-200">Batal</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#0F3D8C] py-2.5 font-semibold text-white hover:bg-[#0B2E69]">Simpan Data</button>
            </div>
          </form>
        </div>
      )}

      {/* POP-UP MODAL 3: LIHAT DETAIL KARTU SISWA */}
      {modalType === "detailSiswa" && selectedSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-sm text-gray-900 border border-gray-100">
            <h3 className="text-lg font-bold text-[#0F3D8C] border-b pb-2 flex items-center gap-2">📋 Kartu Informasi Murid</h3>
            <div className="space-y-2.5 divide-y divide-gray-50 max-h-[60vh] overflow-y-auto pr-1">
              <p className="pt-1"><span className="font-bold text-gray-500 block text-xs uppercase">Nama Lengkap</span> <span className="text-gray-900 font-semibold text-base">{selectedSiswa.namaLengkap}</span></p>
              <p className="pt-2"><span className="font-bold text-gray-500 block text-xs uppercase">Nama Panggilan</span> <span className="text-gray-800">{selectedSiswa.namaPanggilan}</span></p>
              <p className="pt-2"><span className="font-bold text-gray-500 block text-xs uppercase">Kelas Tingkat</span> <span className="text-gray-800">{selectedSiswa.kelas}</span></p>
              <p className="pt-2"><span className="font-bold text-gray-500 block text-xs uppercase">Sekolah Asal</span> <span className="text-gray-800">{selectedSiswa.sekolahAsal}</span></p>
              <p className="pt-2"><span className="font-bold text-gray-500 block text-xs uppercase">Wali / Orang Tua</span> <span className="text-gray-800">{selectedSiswa.namaOrangTuaWali}</span></p>
              <p className="pt-2"><span className="font-bold text-gray-500 block text-xs uppercase">No HP Kontak</span> <span className="text-gray-800 font-mono font-medium">{selectedSiswa.noHpOrangTua}</span></p>
              <p className="pt-2"><span className="font-bold text-gray-500 block text-xs uppercase">Alamat Domisili</span> <span className="text-gray-800">{selectedSiswa.alamatDomisili}</span></p>
              <p className="pt-2"><span className="font-bold text-gray-500 block text-xs uppercase">Jadwal & Mata Pelajaran</span> <span className="text-gray-800 font-medium">{selectedSiswa.mapel} ({selectedSiswa.hari} / {selectedSiswa.jam} WIB)</span></p>
              <p className="pt-2 flex items-center justify-between"><span className="font-bold text-gray-500 text-xs uppercase">Status Pembayaran</span> <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedSiswa.pembayaran === "LUNAS" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{selectedSiswa.pembayaran}</span></p>
              <p className="pt-2 font-medium italic text-gray-700 bg-gray-50 p-2.5 rounded-xl border"><strong>Catatan:</strong> {selectedSiswa.catatanAnak || "Tidak ada catatan khusus."}</p>
            </div>
            <button onClick={() => setModalType(null)} className="w-full mt-2 rounded-xl bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800 transition">Tutup Detail</button>
          </div>
        </div>
      )}
            {/* POP-UP MODAL 1B: FORM EDIT DATA GURU (BARU) */}
      {modalType === ("editGuru" as any) && selectedGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <form onSubmit={handleEditGuru} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-gray-900 border">
            <h3 className="text-xl font-bold text-[#0F3D8C]">Edit Informasi Pengajar</h3>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">Nama Pengajar</label>
              <input type="text" required value={formGuru.nama} onChange={(e) => setFormGuru({...formGuru, nama: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">No HP Kontak</label>
              <input type="text" required value={formGuru.noHp} onChange={(e) => setFormGuru({...formGuru, noHp: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">Email Hak Akses</label>
              <input type="email" required value={formGuru.email} onChange={(e) => setFormGuru({...formGuru, email: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div>
              <label className="text-sm font-semibold block text-gray-700 mb-1">Password Baru (Kosongkan jika tidak diubah)</label>
              <input type="password" placeholder="Minimal 6 karakter" value={formGuru.password} onChange={(e) => setFormGuru({...formGuru, password: e.target.value})} className="w-full rounded-xl border p-2.5 text-gray-900 bg-white outline-none focus:border-[#0F3D8C]" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalType(null)} className="flex-1 rounded-xl bg-gray-100 py-2.5 font-semibold text-gray-700 hover:bg-gray-200">Batal</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#0F3D8C] py-2.5 font-semibold text-white hover:bg-[#0B2E69]">Perbarui Data</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
