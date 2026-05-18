"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // State Manajemen Menu Profil & Sesi User Aktif
  const [userSession, setUserSession] = useState<{ nama: string; peran: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // State Manajemen Pop-up Notifikasi & Validasi Logout
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    isSuccess: boolean;
    isConfirmLogout?: boolean;
  }>({
    show: false,
    title: "",
    message: "",
    isSuccess: false,
    isConfirmLogout: false,
  });

  // Memeriksa sesi login aktif saat pertama kali halaman dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const hasCookieToken = document.cookie.includes("token=");

    // Skenario Timeout 2 Jam: Jika token di cookie sudah dihapus otomatis oleh browser 
    // tetapi di localStorage masih tersimpan data lama, lakukan pembersihan total.
    if (!hasCookieToken && (savedUser || savedToken)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUserSession(null);
      window.location.reload();
      return;
    }

    if (savedUser && savedToken && hasCookieToken) {
      const parsedUser = JSON.parse(savedUser);
      setUserSession(parsedUser);
      
      // PROTEKSI KLIEN: Jika user nekat klik BACK atau ngetik "/" padahal sesi masih aktif,
      // langsung oper (replace) kembali secara paksa ke dashboard hak akses masing-masing.
      if (parsedUser.peran === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, []);

  // Fungsi pembantu untuk memicu munculnya Pop-up
  const showPopup = (title: string, message: string, isSuccess: boolean = false, isConfirmLogout: boolean = false) => {
    setNotification({ show: true, title, message, isSuccess, isConfirmLogout });
  };

  const handleLogin = async () => {
    if (!email) {
      showPopup("Peringatan", "Email / username wajib diisi", false);
      return;
    }
    if (!password) {
      showPopup("Peringatan", "Password wajib diisi", false);
      return;
    }
    if (!role) {
      showPopup("Peringatan", "Role wajib dipilih", false);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tembak API Login Backend
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal masuk");
      }

      // Validasi kesesuaian role pilihan dengan database
      if (data.user.peran.toLowerCase() !== role.toLowerCase()) {
        throw new Error(`Akun Anda terdaftar sebagai ${data.user.peran}, bukan ${role}`);
      }

      // 2. Memicu pop-up selamat datang dinamis dengan nama user asli dari DB
      showPopup("Berhasil", `Selamat datang kembali, ${data.user.nama}!`, true);

      // 3. Simpan data ke Penyimpanan Browser Lokal
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // 4. Set Cookie Native Max-Age (Browser akan otomatis menghapus sesi ini tepat setelah 2 jam)
      document.cookie = `token=${data.token}; path=/; max-age=7200; SameSite=Strict;`;
      
      setUserSession(data.user);

      // Jeda 1.5 detik agar popup sukses terlihat jelas sebelum dialihkan
      setTimeout(() => {
        if (data.user.peran === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }, 1500);

    } catch (err: any) {
      showPopup("Login Gagal", err.message, false);
    } finally {
      setIsLoading(false);
    }
  };

  // Memicu modal konfirmasi logout kustom
  const triggerLogoutValidation = () => {
    setShowProfileMenu(false);
    showPopup(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari sistem Aksara Bimbel?",
      false,
      true
    );
  };

  // Eksekusi pembersihan total sesi (Hapus data & Cookie)
  const executeLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    setUserSession(null);
    setNotification({ show: false, title: "", message: "", isSuccess: false, isConfirmLogout: false });
    
    // Muat ulang halaman total agar status kembali bersih
    window.location.reload();
  };

  return (
    <div className="relative flex min-h-dvh flex-col justify-between overflow-x-hidden bg-[#FFFDF8]">
      
      {/* Background Gelombang Responsif */}
      <div
        className="absolute inset-0 z-0 bg-[#F6E7B5]"
        style={{
          clipPath: "polygon(0 60%, 100% 40%, 100% 100%, 0% 100%)",
        }}
      />

      {/* TOMBOL PROFILE SETTING (Pojok Kanan Atas - Muncul Otomatis Jika Ada Sesi Aktif) */}
      {userSession && (
        <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F3D8C] text-white shadow-md transition hover:bg-[#0B2E69] active:scale-95"
            >
              {/* Optional chaining yang aman dari crash */}
              <span className="font-semibold uppercase">
                {userSession?.nama ? userSession.nama.charAt(0) : "U"}
              </span>
            </button>

            {/* Dropdown Menu Kustom */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-2xl border border-gray-100 z-50 animate-fade-in">
                <div className="border-b border-gray-100 px-3 py-2 text-left">
                  <p className="text-sm font-bold text-gray-900 truncate">{userSession.nama}</p>
                  <p className="text-xs text-gray-400 capitalize">{userSession.peran.toLowerCase()}</p>
                </div>
                <button 
                  onClick={() => alert("Fitur pengaturan profil segera hadir!")}
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
      )}

      {/* Konten Utama Form: Otomatis blur jika modal pop-up tampil */}
      <div className={`relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 transition-all duration-300 ${notification.show ? "blur-md pointer-events-none" : ""}`}>
        
        {/* Kontainer Logo & Judul */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-45 md:w-45 mb-2 sm:mb-4">
            <Image
              src="/logo.png"
              alt="Aksara Bimbel"
              fill
              sizes="auto"
              priority
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-wide text-[#0F3D8C] sm:text-4xl md:text-5xl">
            Aksara Bimbel
          </h1>

          <p className="mt-1 sm:mt-3 text-xs sm:text-sm text-[#7A7A7A]">
            Belajar Asik Bersama Aksara
          </p>
        </div>

        {/* Card Input Form */}
        <div className="mt-6 sm:mt-10 w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-xl sm:shadow-2xl">
          
          <div className="mb-4 sm:mb-5">
            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-[#0F3D8C]">
              Email / Username
            </label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#D6B25E] px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-900 bg-white outline-none transition focus:border-[#0F3D8C]"
            />
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-[#0F3D8C]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#D6B25E] px-3 py-2.5 sm:px-4 sm:py-3 pr-12 sm:pr-14 text-sm text-gray-900 bg-white outline-none transition focus:border-[#0F3D8C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[#0F3D8C] font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="mb-4 sm:mb-5 flex justify-end text-xs sm:text-sm">
            <button className="text-[#0F3D8C] hover:underline">
              Forgot Password
            </button>
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-[#0F3D8C]">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-[#D6B25E] px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-zinc-700 bg-white outline-none transition focus:border-[#0F3D8C]"
            >
              <option value="">Pilih Role</option>
              <option value="guru">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full rounded-xl bg-[#0F3D8C] py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-[#0B2E69] disabled:bg-gray-400 shadow-md active:scale-[0.98]"
          >
            {isLoading ? "Memproses..." : "Login"}
          </button>

        </div>
      </div>

      {/* COMPONENT POP-UP MODAL KUSTOM MULTIFUNGSI */}
      {notification.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl border border-gray-100 animate-fade-in">
            
            {/* Simbol Ikon Status */}
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${notification.isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
              {notification.isSuccess ? "✓" : "!"}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {notification.title}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {notification.message}
            </p>

            {/* Logika Kondisi Tombol Opsi */}
            {notification.isConfirmLogout ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
                  className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={executeLogout}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Ya, Keluar
                </button>
              </div>
            ) : (
              !notification.isSuccess && (
                <button
                  onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
                  className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Tutup
                </button>
              )
            )}
          </div>
        </div>
      )}

    </div>
  );
}
