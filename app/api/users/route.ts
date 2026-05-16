import prisma from "@/lib/prisma"

// MENGAMBIL SEMUA DAFTAR PENGGUNA (ADMIN & GURU)
export async function GET() {
  try {
    const semuaPengguna = await prisma.pengguna.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        createdAt: true,
        // Password sengaja tidak diambil demi keamanan
      },
      orderBy: {
        createdAt: "desc", // Urutkan dari yang paling baru didaftarkan
      },
    })

    return Response.json(semuaPengguna)
  } catch (error) {
    console.error("ERROR GET USERS:", error)
    return Response.json(
      { message: "Gagal mengambil data pengguna" },
      { status: 500 }
    )
  }
}
