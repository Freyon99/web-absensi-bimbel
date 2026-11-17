import type { HasilImport } from "../types"

interface HasilImportModalProps {
  hasilImport: HasilImport | null
  onTutup: () => void
}

export default function HasilImportModal({ hasilImport, onTutup }: HasilImportModalProps) {
  if (!hasilImport) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <h3 className="text-xl font-bold text-[#0F3D8C]">Hasil Import Data Murid</h3>
        <p className="mt-2 text-sm text-gray-600">{hasilImport.message}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Baris", nilai: hasilImport.summary.total, warna: "text-gray-900" },
            {
              label: "Berhasil",
              nilai: hasilImport.summary.success,
              warna: "text-emerald-700",
            },
            { label: "Duplikat", nilai: hasilImport.summary.skipped, warna: "text-amber-700" },
            { label: "Gagal", nilai: hasilImport.summary.failed, warna: "text-rose-700" },
          ].map((kartu) => (
            <div
              key={kartu.label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center"
            >
              <p className={`text-2xl font-bold ${kartu.warna}`}>{kartu.nilai}</p>
              <p className="mt-1 text-xs text-gray-500">{kartu.label}</p>
            </div>
          ))}
        </div>

        {hasilImport.errors.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-bold text-gray-700">
              Detail kendala {hasilImport.errors.length >= 50 ? "(50 kendala pertama)" : ""}:
            </p>
            <div className="mt-2 max-h-56 divide-y divide-gray-50 overflow-y-auto rounded-xl border border-gray-100">
              {hasilImport.errors.map((item, indeks) => (
                <p key={indeks} className="px-3 py-2 text-xs text-gray-600">
                  <span className="font-bold text-rose-600">Baris {item.row}:</span> {item.message}
                </p>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onTutup}
          className="mt-5 w-full rounded-xl bg-[#0F3D8C] py-3 font-semibold text-white hover:bg-[#0B2E69] transition"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
