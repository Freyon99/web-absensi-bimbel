"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [role, setRole] = useState("");
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFFDF8]">
      {/* Background Shape */}
      <div
        className="absolute inset-0 z-0 bg-[#F6E7B5]"
        style={{
          clipPath: "polygon(0 55%, 100% 35%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 pt-16">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Aksara Bimbel"
          width={180}
          height={180}
          className="mb-4"
        />

        {/* Title */}
        <h1 className="text-5xl font-bold tracking-wide text-[#0F3D8C]">
          Aksara Bimbel
        </h1>

        <p className="mt-3 text-center text-sm text-[#7A7A7A]">
          Belajar Asik Bersama Aksara
        </p>

        {/* Login Card */}
        <div className="mt-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
          {/* Email */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
              Email / Username
            </label>

            <input
              type="email"
              placeholder="Masukkan email"
              className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 outline-none transition focus:border-[#0F3D8C]"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#0F3D8C]">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#D6B25E] px-4 py-3 outline-none transition focus:border-[#0F3D8C]"
            />
          </div>

          {/* Remember */}
          <div className="mb-6 flex justify-end text-sm">
            <button className="text-[#0F3D8C] hover:underline">
              Forgot Password
            </button>
          </div>

          {/* Role */}
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

          {/* Button */}
          <button className="w-full rounded-xl bg-[#0F3D8C] py-3 font-semibold text-white transition hover:bg-[#0B2E69]">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
