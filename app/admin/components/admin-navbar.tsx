import type { RefObject } from "react"
import type { UserProfile } from "../types"

interface AdminNavbarProps {
  user: UserProfile
  showProfileMenu: boolean
  dropdownRef: RefObject<HTMLDivElement | null>
  onToggleProfileMenu: () => void
  onProfileSettings: () => void
  onLogout: () => void
}

export default function AdminNavbar({
  user,
  showProfileMenu,
  dropdownRef,
  onToggleProfileMenu,
  onProfileSettings,
  onLogout,
}: AdminNavbarProps) {
  return (
    <nav className="flex items-center justify-between bg-white px-8 py-4 shadow relative z-20 shrink-0">
      <h1 className="text-xl font-bold text-[#0F3D8C]">Aksara Bimbel (Admin)</h1>
      <div className="flex items-center gap-4">
        <div className="hidden sm:block rounded-lg border border-[#D6B25E] px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50">
          {user.nama}
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={onToggleProfileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F3D8C] text-white shadow-md transition hover:bg-[#0B2E69] active:scale-95"
          >
            <span className="font-semibold uppercase">{user.nama.charAt(0)}</span>
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl bg-white p-2 shadow-2xl border border-gray-100 z-50">
              <div className="border-b border-gray-100 px-3 py-2 text-left">
                <p className="text-sm font-bold text-gray-900 truncate">{user.nama}</p>
                <p className="text-xs text-gray-400 capitalize">{user.peran.toLowerCase()}</p>
              </div>
              <button
                onClick={onProfileSettings}
                className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Profile Settings
              </button>
              <button
                onClick={onLogout}
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
