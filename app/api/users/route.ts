import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const allUsers = await prisma.pengguna.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        peran: true,
        noHp: true, // ➕ WAJIB ditambahkan agar nomor HP ditarik dari database
      },
    })
    return Response.json(allUsers)
  } catch (error) {
    return Response.json({ message: "Gagal memuat data pengguna" }, { status: 500 })
  }
}
