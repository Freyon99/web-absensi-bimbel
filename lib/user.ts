/**
 * Bentuk user yang dikirim ke klien. Satu sumber untuk semua route yang
 * mengembalikan data pengguna, supaya password dan timestamp (createdAt,
 * updatedAt) tidak ikut bocor ke respons.
 */
export function bentukUserPublik(user: {
  id: string
  nama: string
  email: string
  peran: string
  noHp: string | null
}) {
  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    peran: user.peran,
    noHp: user.noHp,
  }
}
