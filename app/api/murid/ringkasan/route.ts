import prisma from "@/lib/prisma";
import { responGuard, wajibAuth } from "@/lib/api-guard";
import { Kelas, Prisma } from "@prisma/client";
import { KELAS_OPTIONS } from "@/lib/kelas";

/**
 * Ringkasan murid untuk kartu statistik & grafik admin. Filter bisa menyusul
 * supaya total mengikuti filter yang sedang dipakai di Data Siswa.
 * Dipisah dari GET /api/murid agar klien tidak menarik semua baris hanya
 * untuk menghitung.
 */
export async function GET(req: Request) {
  try {
    await wajibAuth(req);

    const params = new URL(req.url).searchParams;
    const where: Prisma.MuridWhereInput = {};

    const kelas = params.get("kelas");
    if (kelas && (KELAS_OPTIONS as readonly string[]).includes(kelas)) {
      where.kelas = kelas as Kelas;
    }

    const pembayaran = params.get("pembayaran");
    if (pembayaran) where.pembayaran = pembayaran;

    const cari = params.get("cari");
    if (cari) where.namaLengkap = { contains: cari, mode: "insensitive" };

    const banding = Object.keys(where).length > 0 ? where : undefined;

    const [total, daftarKelas, daftarPembayaran] = await Promise.all([
      prisma.murid.count({ where: banding }),
      prisma.murid.groupBy({
        by: ["kelas"],
        where: banding,
        _count: { _all: true },
      }),
      prisma.murid.groupBy({
        by: ["pembayaran"],
        where: banding,
        _count: { _all: true },
      }),
    ]);

    const perKelas: Record<string, number> = {};
    for (const item of daftarKelas) perKelas[item.kelas] = item._count._all;

    const perPembayaran: Record<string, number> = {};
    for (const item of daftarPembayaran) perPembayaran[item.pembayaran] = item._count._all;

    return Response.json({
      total,
      perKelas,
      perPembayaran,
      lunas: perPembayaran["LUNAS"] ?? 0,
      belumLunas: perPembayaran["BELUM LUNAS"] ?? 0,
    });
  } catch (error) {
    const guard = responGuard(error);
    if (guard) return guard;

    console.error("DETAIL ERROR RINGKASAN MURID:", error);
    return Response.json(
      { message: "Gagal mengambil ringkasan murid" },
      { status: 500 }
    );
  }
}
