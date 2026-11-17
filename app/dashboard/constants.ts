export const STATUS_OPTIONS = [
  { value: "HADIR", label: "Hadir", select: "border-emerald-300 text-emerald-700" },
  { value: "IZIN", label: "Izin", select: "border-sky-300 text-sky-700" },
  { value: "SAKIT", label: "Sakit", select: "border-amber-300 text-amber-700" },
  { value: "ALPHA", label: "Alpha", select: "border-rose-300 text-rose-700" },
]

export const STATUS_SELECT_STYLE = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.select]),
) as Record<string, string>

export function getInitials(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

export function formatJam(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatTanggalHariIni() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
