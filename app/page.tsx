"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearSession, logout, touchSession } from "@/lib/session"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // State Manajemen Menu Profil & Sesi User Aktif
  const [userSession, setUserSession] = useState<{ nama: string; peran: string } | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // State Manajemen Pop-up Notifikasi & Validasi Logout
  const [notification, setNotification] = useState<{
    show: boolean
    title: string
    message: string
    isSuccess: boolean
    isConfirmLogout?: boolean
  }>({
    show: false,
    title: "",
    message: "",
    isSuccess: false,
    isConfirmLogout: false,
  })

  // Memeriksa sesi login aktif saat pertama kali halaman dimuat.
  // Sesi hidup di cookie HttpOnly, jadi validitasnya dikonfirmasi ke server.
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (!savedUser) return

    ;(async () => {
      try {
        const res = await fetch("/api/me")
        if (!res.ok) {
          clearSession()
          return
        }

        const data = await res.json()
        setUserSession(data.user)

        // PROTEKSI KLIEN: jika user membuka "/" padahal sesi masih aktif,
        // langsung diarahkan ke dashboard hak akses masing-masing.
        router.replace(data.user.peran === "ADMIN" ? "/admin" : "/dashboard")
      } catch {
        clearSession()
      }
    })()
  }, [router])

  // Fungsi pembantu untuk memicu munculnya Pop-up
  const showPopup = (
    title: string,
    message: string,
    isSuccess: boolean = false,
    isConfirmLogout: boolean = false,
  ) => {
    setNotification({ show: true, title, message, isSuccess, isConfirmLogout })
  }

  const handleLogin = async () => {
    if (!email) {
      showPopup("Peringatan", "Email / username wajib diisi", false)
      return
    }
    if (!password) {
      showPopup("Peringatan", "Password wajib diisi", false)
      return
    }

    setIsLoading(true)

    try {
      // 1. Tembak API Login Backend
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal masuk")
      }

      // 2. Memicu pop-up selamat datang dinamis dengan nama user asli dari DB
      showPopup("Berhasil", `Selamat datang kembali, ${data.user.nama}!`, true)

      // 3. Simpan penanda sesi (token tetap di cookie HttpOnly server)
      localStorage.setItem("user", JSON.stringify(data.user))

      // 4. Set Cookie Native Max-Age (Browser akan otomatis menghapus sesi ini tepat setelah 2 jam)
      touchSession()

      setUserSession(data.user)

      // Jeda 1.5 detik agar popup sukses terlihat jelas sebelum dialihkan
      setTimeout(() => {
        if (data.user.peran === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }, 1200)
    } catch (err) {
      showPopup("Login Gagal", err instanceof Error ? err.message : "Gagal masuk", false)
    } finally {
      setIsLoading(false)
      // Password tidak disimpan di state setelah percobaan login selesai.
      setPassword("")
    }
  }

  // Memicu modal konfirmasi logout kustom
  const triggerLogoutValidation = () => {
    setShowProfileMenu(false)
    showPopup(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari sistem Aksara Bimbel?",
      false,
      true,
    )
  }

  // Eksekusi pembersihan total sesi (Hapus data & Cookie)
  const executeLogout = () => {
    setNotification({
      show: false,
      title: "",
      message: "",
      isSuccess: false,
      isConfirmLogout: false,
    })
    void logout()
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-between overflow-x-hidden bg-[#FFFDF8]">
      {/* Latar dekoratif: gelombang lembut (murni visual) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Background Gelombang Responsif */}
        <div
          className="absolute inset-0 bg-[#F6E7B5] animate-drift"
          style={{
            clipPath: "polygon(0 60%, 100% 40%, 100% 100%, 0% 100%)",
          }}
        />
        {/* Lapisan gelombang kedua untuk kesan kedalaman */}
        <div
          className="absolute inset-0 bg-[#D6B25E]/20 animate-drift"
          style={{
            clipPath: "polygon(0 74%, 100% 58%, 100% 100%, 0% 100%)",
            animationDelay: "-7s",
          }}
        />
      </div>

      {/* TOMBOL PROFILE SETTING (Pojok Kanan Atas - Muncul Otomatis Jika Ada Sesi Aktif) */}
      {userSession && (
        <div className="absolute right-4 top-4 z-30 sm:right-6 sm:top-6 animate-fade-in">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F3D8C] text-white shadow-md transition duration-300 hover:scale-105 hover:bg-[#0B2E69] active:scale-95"
            >
              {/* Optional chaining yang aman dari crash */}
              <span className="font-semibold uppercase">
                {userSession?.nama ? userSession.nama.charAt(0) : "U"}
              </span>
            </button>

            {/* Dropdown Menu Kustom */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-2xl border border-gray-100 z-50 animate-scale-in">
                <div className="border-b border-gray-100 px-3 py-2 text-left">
                  <p className="text-sm font-bold text-gray-900 truncate">{userSession.nama}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {userSession.peran.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => alert("Fitur pengaturan profil segera hadir!")}
                  className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Profile Settings
                </button>
                <button
                  onClick={triggerLogoutValidation}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Konten Utama Form: Otomatis blur jika modal pop-up tampil */}
      <div
        className={`relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 transition-all duration-300 ${notification.show ? "blur-md pointer-events-none" : ""}`}
      >
        {/* Kontainer Logo & Judul */}
        <div className="flex flex-col items-center text-center">
          <div
            className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-45 md:w-45 mb-2 sm:mb-4"
            style={{
              animation:
                "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both, float-soft 6s ease-in-out 0.8s infinite",
            }}
          >
            <Image
              src="/logo.png"
              alt="Aksara Bimbel"
              fill
              sizes="auto"
              priority
              className="object-contain"
            />
          </div>

          <h1
            className="text-3xl font-bold tracking-wide text-[#0F3D8C] sm:text-4xl md:text-5xl animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            Aksara Bimbel
          </h1>

          <p
            className="mt-1 sm:mt-3 text-xs sm:text-sm text-[#7A7A7A] animate-fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            Belajar Asik Bersama Aksara
          </p>
        </div>

        {/* Card Input Form */}
        <div
          className="mt-6 sm:mt-10 w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-xl sm:shadow-2xl transition-shadow duration-300 animate-fade-up hover:shadow-[0_24px_60px_-15px_rgba(15,61,140,0.35)]"
          style={{ animationDelay: "0.35s" }}
        >
          <div className="mb-4 sm:mb-5 group animate-fade-up" style={{ animationDelay: "0.45s" }}>
            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-[#0F3D8C] transition-colors duration-200 group-focus-within:text-[#0B2E69]">
              Email / Username
            </label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#D6B25E] px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-900 bg-white outline-none transition duration-200 hover:border-[#0F3D8C]/50 focus:border-[#0F3D8C] focus:ring-4 focus:ring-[#D6B25E]/25"
            />
          </div>

          <div className="mb-3 sm:mb-4 group animate-fade-up" style={{ animationDelay: "0.55s" }}>
            <label className="mb-1.5 block text-xs sm:text-sm font-medium text-[#0F3D8C] transition-colors duration-200 group-focus-within:text-[#0B2E69]">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#D6B25E] px-3 py-2.5 sm:px-4 sm:py-3 pr-12 sm:pr-14 text-sm text-gray-900 bg-white outline-none transition duration-200 hover:border-[#0F3D8C]/50 focus:border-[#0F3D8C] focus:ring-4 focus:ring-[#D6B25E]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[#0F3D8C] font-medium transition-transform duration-200 hover:scale-110 active:scale-90"
              >
                <span key={showPassword ? "hide" : "show"} className="inline-block animate-fade-in">
                  {showPassword ? "Hide" : "Show"}
                </span>
              </button>
            </div>
          </div>

          <div
            className="mb-4 sm:mb-5 flex justify-end text-xs sm:text-sm animate-fade-up"
            style={{ animationDelay: "0.65s" }}
          >
            <button
              type="button"
              onClick={() =>
                showPopup(
                  "Lupa Password",
                  "Reset password hanya bisa dilakukan admin. Silakan hubungi admin Aksara Bimbel untuk mengatur ulang password Anda.",
                  false,
                )
              }
              className="inline-block text-[#0F3D8C] transition-transform duration-200 hover:translate-x-0.5 hover:underline"
            >
              Forgot Password
            </button>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "0.75s" }}>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-[#0F3D8C] py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B2E69] hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {/* Sapuan cahaya saat hover */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading && (
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                {isLoading ? "Memproses..." : "Login"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENT POP-UP MODAL KUSTOM MULTIFUNGSI */}
      {notification.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl border border-gray-100 ${
              notification.isSuccess || notification.isConfirmLogout
                ? "animate-scale-in"
                : "animate-pop-shake"
            }`}
          >
            {/* Simbol Ikon Status */}
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold animate-scale-in ${
                notification.isSuccess
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-600"
              }`}
              style={{ animationDelay: "0.1s" }}
            >
              {notification.isSuccess ? "✓" : "!"}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{notification.title}</h3>
            <p className="text-sm text-gray-500 mb-5">{notification.message}</p>

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
  )
}
