import type { UserProfile } from "../types"

interface GuruSectionProps {
  guruList: UserProfile[]
  onTambahGuru: () => void
  onDetailGuru: (guru: UserProfile) => void
  onEditGuru: (guru: UserProfile) => void
  onHapusGuru: (id: string, nama: string) => void
}

export default function GuruSection({
  guruList,
  onTambahGuru,
  onDetailGuru,
  onEditGuru,
  onHapusGuru,
}: GuruSectionProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#0F3D8C]">Data Guru</h3>
          <p className="text-sm text-gray-500">Daftar pengajar Aksara Bimbel.</p>
        </div>
        <button
          onClick={onTambahGuru}
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
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Belum ada data pengajar terdaftar
                </td>
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
                      onClick={() => onDetailGuru(item)}
                      className="mr-2 text-blue-600 hover:underline"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => onEditGuru(item)}
                      className="mr-2 text-yellow-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onHapusGuru(item.id, item.nama)}
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
  )
}
