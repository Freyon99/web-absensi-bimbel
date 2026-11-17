"use client"

import type { RefObject } from "react"
import { useNotification } from "@/context/NotificationContext"
import type { UserProfile } from "../types"
import { getInitials } from "../constants"

interface GuruNavbarProps {
  user: UserProfile
  showProfileMenu: boolean
  profileRef: RefObject<HTMLDivElement | null>
  setShowProfileMenu: (value: boolean) => void
  setSidebarMobileBuka: (value: boolean) => void
  triggerLogoutValidation: () => void
}

export default function GuruNavbar({
  user,
  showProfileMenu,
  profileRef,
  setShowProfileMenu,
  setSidebarMobileBuka,
  triggerLogoutValidation,
}: GuruNavbarProps) {
  const { showNotification } = useNotification()

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarMobileBuka(true)}
          aria-label="Buka menu"
          className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 lg:hidden"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-lg font-bold text-[#0F3D8C] sm:text-xl">Aksara Bimbel</h1>
          <p className="hidden text-xs text-gray-400 sm:block">Panel Pengajar</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-lg border border-[#D6B25E] bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 sm:block">
          {user.nama}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-label="Menu profil"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F3D8C] text-white shadow-md transition hover:bg-[#0B2E69] active:scale-95"
          >
            <span className="font-semibold uppercase">{getInitials(user.nama)}</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-2xl">
              <div className="border-b border-gray-100 px-3 py-2 text-left">
                <p className="truncate text-sm font-bold text-gray-900">{user.nama}</p>
                <p className="text-xs capitalize text-gray-400">{user.peran.toLowerCase()}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  showNotification(
                    "Informasi Sistem",
                    "Fitur pengaturan profil pengajar segera hadir!",
                    true,
                  )
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
  )
}
