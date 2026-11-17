import { MENU_ADMIN } from "../constants"
import type { MenuAdmin } from "../types"

interface AdminSidebarProps {
  menuAktif: MenuAdmin
  onPilihMenu: (menu: MenuAdmin) => void
}

export default function AdminSidebar({ menuAktif, onPilihMenu }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-[#0F3D8C] p-5 text-white shrink-0 min-h-full">
      <h2 className="mb-4 text-lg font-bold">Menu Admin</h2>
      <div className="space-y-2">
        {MENU_ADMIN.map((menu) => (
          <button
            key={menu}
            onClick={() => onPilihMenu(menu)}
            className={`w-full rounded-xl px-4 py-3 text-left transition ${menuAktif === menu ? "bg-[#D6B25E] text-[#0F3D8C]" : "hover:bg-[#1B4FA3]"}`}
          >
            {menu}
          </button>
        ))}
      </div>
    </aside>
  )
}
