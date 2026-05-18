"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext"; // Menggunakan Context baru

interface UserProfile {
  nama: string;
  email: string;
  peran: string;
}

interface Murid {
  id: string;
  namaLengkap: string;
  kelas: string;
}

interface LogAbsenGuru {
  id: string;
  waktuMasuk: string;
  waktuPulang: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  
  // Ambil kendali pop-up kustom dan loading dari Context Global (Layout)
  const { showNotification, showConfirmLogout, setIsLoadingGlobal } = useNotification();

  // State Navigasi & Menu
  const [menuAktif, setMenuAktif] = useState("Absensi Guru");
  const [kelasAktif, setKelasAktif] = useState("Calistung");
  const [showKelas, setShowKelas] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // State Data Dinamis dari Database
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allMurid, setAllMurid] = useState<Murid[]>([]);
  const [riwayatAbsenGuru, setRiwayatAbsenGuru] = useState<LogAbsenGuru[]>([]);
  const [absenSiswa, setAbsenSiswa] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const kelasList = [
    "Calistung", "SD 1", "SD 2", "SD 3", "SD 4", "SD 5", "SD 6",
    "SMP 1", "SMP 2", "SMP 3", "SMK 1", "SMK 2", "SMK 3"
  ];

  // 1. Ambil Sesi Login Pengguna dengan Animasi Loading Global terpusat
  useEffect(() => {
    const checkGuruSession = async () => {
      setIsLoadingGlobal(true); // Aktifkan loading spinner di tengah layar

      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (!savedToken || !savedUser) {
        router.push("/");
        setIsLoadingGlobal(false);
        return;
      }

      const parsedUser = JSON.parse(savedUser);

      if (parsedUser.peran === "ADMIN") {
        router.push("/admin");
        setIsLoadingGlobal(false);
        return;
      }

      setUser(parsedUser);
      // Tunggu data murid dan riwayat absen selesai diambil berbarengan
      await Promise.all([fetchDataMurid(), fetchRiwayatAbsenGuru()]);
      
      setIsLoadingGlobal(false); // Matikan loading spinner
    };

    checkGuruSession();
  }, []);

  // 2. AMBIL DATA MURID (GET /api/murid)
  const fetchDataMurid = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/murid", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllMurid(data);
      }
    } catch (error) {
      console.error("Gagal memuat data murid:", error);
    }
  };

  // 3. AMBIL DATA LOG ABSENSI GURU (GET /api/absensi-guru) — Membaca aman lewat Token Header
  const fetchRiwayatAbsenGuru = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/absensi-guru", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRiwayatAbsenGuru(data);
      }
    } catch (error) {
      console.error("Gagal memuat log absen guru:", error);
    }
  };

  // 4. LOGIKA ABSEN MASUK GURU (POST /api/absensi-guru)
  const handleAbsenGuruDatang = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/absensi-guru", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        showNotification("Berhasil", "Absen datang Anda hari ini sukses dicatat!", true);
        fetchRiwayatAbsenGuru();
      } else {
        showNotification("Gagal Absen", data.message || "Terjadi kesalahan", false);
      }
    } catch (error) {
      showNotification("Error", "Terjadi kesalahan jaringan", false);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. LOGIKA ABSEN PULANG GURU (PUT /api/absensi-guru)
  const handleAbsenGuruPulang = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/absensi-guru", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const data = await res.json();
      if (res.ok) {
        showNotification("Berhasil", "Absen pulang Anda hari ini sukses dicatat!", true);
        fetchRiwayatAbsenGuru(); 
      } else {
        showNotification("Gagal Absen", data.message || "Terjadi kesalahan", false);
      }
    } catch (error) {
      showNotification("Error", "Terjadi kesalahan jaringan", false);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. LOGIKA SIMPAN ABSENSI SISWA (POST /api/absensi) — Aman tanpa kirim guruId di body
  const handleSimpanAbsensiSiswa = async () => {
    if (!user || muridPerKelas.length === 0) return;
    
    setIsLoading(true);
    let successCount = 0;

    try {
      const token = localStorage.getItem("token");

      for (const murid of muridPerKelas) {
        const statusSiswa = absenSiswa[murid.id] || "ALPHA";

        const res = await fetch("/api/absensi", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            muridId: murid.id,
            status: statusSiswa,
          }),
        });

        if (res.ok) successCount++;
      }

      showNotification("Berhasil Disimpan", `Sukses mencatat ${successCount} data absensi siswa Kelas ${kelasAktif}!`, true);
    } catch (error) {
      showNotification("Gagal Menyimpan", "Terjadi kegagalan sistem saat menyimpan absensi", false);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerLogoutValidation = () => {
    setShowProfileMenu(false);
    showConfirmLogout(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari sistem Aksara Bimbel?",
      executeLogout
    );
  };

  const executeLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.reload();
  };

  const muridPerKelas = allMurid.filter((m) => m.kelas.toLowerCase() === kelasAktif.toLowerCase());

  if (!user) return null;
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-gray-900">
      {/* Navbar Utama */}
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow relative z-20">
        <h1 className="text-xl font-bold text-[#0F3D8C]">Aksara Bimbel</h1>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block rounded-lg border border-[#D6B25E] px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50"> {user.nama}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F3D8C] text-white shadow-md transition hover:bg-[#0B2E69] active:scale-95"
            >
              <span className="font-semibold uppercase">{user.nama.charAt(0)}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-2xl border border-gray-100 z-50">
                <div className="border-b border-gray-100 px-3 py-2 text-left">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.nama}</p>
                  <p className="text-xs text-gray-400 capitalize">{user.peran.toLowerCase()}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    showNotification("Informasi Sistem", "Fitur pengaturan profil pengajar segera hadir!", true);
                  }}
                  className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile Settings
                </button>
                <button
                  onClick={triggerLogoutValidation}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Konten Utama Layout Dinamik */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-[calc(100vh-72px)] w-64 bg-[#0F3D8C] p-5 text-white shrink-0">
          <h2 className="mb-4 text-lg font-bold">Menu Guru</h2>

          <div className="space-y-2">
            <button
              onClick={() => setMenuAktif("Absensi Guru")}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${
                menuAktif === "Absensi Guru" ? "bg-[#D6B25E] text-[#0F3D8C]" : "hover:bg-[#1B4FA3]"
              }`}
            >
              Absensi Guru
            </button>

            <button
              onClick={() => setShowKelas(!showKelas)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-[#1B4FA3]"
            >
              <span>Pilihan Kelas</span>
              <span>{showKelas ? "▲" : "▼"}</span>
            </button>

            {showKelas && (
              <div className="ml-3 max-h-60 overflow-y-auto space-y-1 pr-1">
                {kelasList.map((kelas) => (
                  <button
                    key={kelas}
                    onClick={() => {
                      setKelasAktif(kelas);
                      setMenuAktif("Absensi Siswa");
                    }}
                    className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
                      menuAktif === "Absensi Siswa" && kelasAktif === kelas
                        ? "bg-[#D6B25E] text-[#0F3D8C]" : "hover:bg-[#1B4FA3]"
                    }`}
                  >
                    {kelas}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Area Panel Konten Utama */}
        <main className="flex-1 p-8">
          {/* TAMPILAN 1: ABSENSI GURU */}
          {menuAktif === "Absensi Guru" && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#0F3D8C]">Absensi Guru</h2>
                <p className="mt-1 text-gray-500">Catat kehadiran datang, pulang, dan pantau riwayat mengajar Anda.</p>
              </div>

              <div className="mb-6 flex gap-4">
                <button
                  onClick={handleAbsenGuruDatang}
                  disabled={isLoading}
                  className="rounded-xl bg-[#0F3D8C] px-6 py-3 font-semibold text-white hover:bg-[#0B2E69] transition disabled:bg-gray-400 shadow-md active:scale-95"
                >
                  Absen Datang
                </button>

                <button
                  onClick={handleAbsenGuruPulang}
                  disabled={isLoading}
                  className="rounded-xl bg-[#D6B25E] px-6 py-3 font-semibold text-[#0F3D8C] hover:bg-[#c7a34e] transition disabled:bg-gray-400 shadow-md active:scale-95"
                >
                  Absen Pulang
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                <table className="w-full">
                  <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                    <tr>
                      <th className="px-4 py-3 text-left">Nama Guru</th>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jam Datang</th>
                      <th className="px-4 py-3 text-left">Jam Pulang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatAbsenGuru.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada riwayat kehadiran</td>
                      </tr>
                    ) : (
                      riwayatAbsenGuru.map((log) => {
                        const dateObjMasuk = new Date(log.waktuMasuk);
                        const dateObjPulang = log.waktuPulang ? new Date(log.waktuPulang) : null;
                        return (
                          <tr key={log.id} className="border-t">
                            <td className="px-4 py-3 text-gray-700 font-medium">{user.nama}</td>
                            <td className="px-4 py-3 text-gray-600">{dateObjMasuk.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                            <td className="px-4 py-3 text-gray-600 font-semibold">{dateObjMasuk.toLocaleTimeString("id-ID")}</td>
                            <td className="px-4 py-3 text-gray-600 font-semibold">
                              {dateObjPulang ? dateObjPulang.toLocaleTimeString("id-ID") : "Belum Absen Pulang"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAMPILAN 2: ABSENSI SISWS */}
          {menuAktif === "Absensi Siswa" && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-[#0F3D8C]">Absensi Kelas {kelasAktif}</h2>
                <p className="mt-1 text-gray-500">Pengajar: <span className="font-semibold text-blue-700">{user.nama}</span></p>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                <table className="w-full">
                  <thead className="bg-[#F6E7B5] text-[#0F3D8C]">
                    <tr>
                      <th className="px-5 py-4 text-left">No</th>
                      <th className="px-5 py-4 text-left">Nama Siswa</th>
                      <th className="px-5 py-4 text-left">Status Kehadiran</th>
                      <th className="px-5 py-4 text-left">Pengajar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {muridPerKelas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                          Tidak ada data murid terdaftar untuk <span className="font-bold text-red-500">Kelas {kelasAktif}</span> di database.
                        </td>
                      </tr>
                    ) : (
                      muridPerKelas.map((murid, index) => (
                        <tr key={murid.id} className="border-t hover:bg-gray-50 transition">
                          <td className="px-5 py-4 text-gray-600">{index + 1}</td>
                          <td className="px-5 py-4 font-semibold text-gray-700">{murid.namaLengkap}</td>
                          <td className="px-5 py-4">
                            <select
                              value={absenSiswa[murid.id] || "ALPHA"}
                              onChange={(e) =>
                                setAbsenSiswa({
                                  ...absenSiswa,
                                  [murid.id]: e.target.value,
                                })
                              }
                              className="rounded-lg border border-[#D6B25E] bg-white px-3 py-2 text-sm text-gray-700 font-medium outline-none focus:border-[#0F3D8C]"
                            >
                              <option value="HADIR">Hadir</option>
                              <option value="IZIN">Izin</option>
                              <option value="SAKIT">Sakit</option>
                              <option value="ALPHA">Alpha</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 text-gray-600 font-medium">{user.nama}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {muridPerKelas.length > 0 && (
                <button
                  onClick={handleSimpanAbsensiSiswa}
                  disabled={isLoading}
                  className="mt-6 rounded-xl bg-[#0F3D8C] px-6 py-3 font-semibold text-white hover:bg-[#0B2E69] transition disabled:bg-gray-400 shadow-md active:scale-95"
                >
                  {isLoading ? "Menyimpan Ke Database..." : "Simpan Absensi"}
                </button>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
