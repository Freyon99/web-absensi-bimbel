"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const users = [
    {
      email: "tasya@gmail.com",
      password: "123",
      role: "guru",
    },
  ];

  const handleLogin = () => {
    if (!email) {
      alert("Email / username wajib diisi");
      return;
    }

    if (!password) {
      alert("Password wajib diisi");
      return;
    }

    if (!role) {
      alert("Role wajib dipilih");
      return;
    }

    // LOGIN ADMIN
    if (role === "admin" && email === "admin" && password === "admin") {
      alert("Berhasil masuk sebagai admin");
      router.push("/admin");
      return;
    }

    // LOGIN GURU
    if (role === "guru") {
      const user = users.find(
        (u) =>
          u.email === email && u.password === password && u.role === "guru",
      );

      if (user) {
        alert("Berhasil masuk sebagai guru");
        router.push("/dashboard");
      } else {
        alert("Email atau password guru salah / belum terdaftar");
      }

      return;
    }

    alert("Username atau password salah");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFFDF8]">
      <div
        className="absolute inset-0 z-0 bg-[#F6E7B5]"
        style={{
          clipPath: "polygon(0 55%, 100% 35%, 100% 100%, 0% 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-4 pt-16">
        <Image
          src="/logo.png"
          alt="Aksara Bimbel"
          width={180}
          height={180}
          className="mb-4"
        />

        <h1 className="text-5xl font-bold tracking-wide text-[#0F3D8C]">
          Aksara Bimbel
        </h1>

        <p className="mt-3 text-center text-sm text-[#7A7A7A]">
          Belajar Asik Bersama Aksara
        </p>

        <div className="mt-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
              Email / Username
            </label>

            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 outline-none transition focus:border-[#0F3D8C]"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 pr-14 outline-none transition focus:border-[#0F3D8C]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#0F3D8C]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-end text-sm">
            <button className="text-[#0F3D8C] hover:underline">
              Forgot Password
            </button>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 text-zinc-400 outline-none transition focus:border-[#0F3D8C]"
            >
              <option value="">Pilih Role</option>
              <option value="guru">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-[#0F3D8C] py-3 font-semibold text-white transition hover:bg-[#0B2E69]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
