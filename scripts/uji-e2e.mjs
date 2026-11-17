// Uji end-to-end aturan absensi + auth. Jalanin dengan `npm run test:e2e`.
// Butuh build terbaru (script membuild otomatis bila .next/BUILD_ID belum ada).
import { readFileSync, existsSync } from "node:fs"
import { spawn, spawnSync } from "node:child_process"
import { createRequire } from "node:module"

const require = createRequire(new URL("../package.json", import.meta.url))
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")

const ROOT = new URL("..", import.meta.url).pathname
const PORT = 3111
const BASE = `http://127.0.0.1:${PORT}`

function muatEnv() {
  const env = {}
  for (const baris of readFileSync(`${ROOT}/.env`, "utf8").split("\n")) {
    const m = baris.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "")
  }
  return env
}

const env = muatEnv()
const prisma = new PrismaClient()
const hasil = []
let server = null

function cek(nama, kondisi, detail = "") {
  hasil.push({ nama, ok: Boolean(kondisi), detail })
  if (kondisi) {
    console.log(`  OK   ${nama}`)
  } else {
    console.error(`  GAGAL ${nama}${detail ? ` — ${detail}` : ""}`)
  }
}

function jalankan(cmd, args, opsi = {}) {
  const proses = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", ...opsi })
  if (proses.status !== 0) throw new Error(`${cmd} ${args.join(" ")} gagal (${proses.status})`)
}

async function tungguServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${BASE}/`)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error("server tidak siap dalam 60 detik")
}

async function mulaiServer() {
  const binerNext = `${ROOT}/node_modules/next/dist/bin/next`
  server = spawn(process.execPath, [binerNext, "start", "-p", String(PORT)], {
    cwd: ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  })
  let log = ""
  server.stdout.on("data", (d) => (log += d))
  server.stderr.on("data", (d) => (log += d))
  await tungguServer()
  return log
}

async function panggil(method, path, headers = {}, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {}
  return { status: res.status, data }
}

function tandaPengguna(id, peran) {
  return jwt.sign({ id, role: peran }, env.JWT_SECRET, { expiresIn: "1h" })
}

async function bersihkan() {
  try {
    if (server) server.kill()
  } catch {}
  await prisma.$disconnect()
}

const emailUji = `uji-e2e-${Date.now()}@aksara.local`
const sandiUji = "passwordUji123"
const idUji = []

async function main() {
  if (!existsSync(`${ROOT}/.next/BUILD_ID`)) {
    console.log("Build belum ada, menjalankan npm run build...")
    jalankan("npm", ["run", "build"])
  }

  console.log("Menjalankan server uji di", BASE)
  await mulaiServer()

  const a = new Date()
  a.setHours(0, 0, 0, 0)
  const b = new Date()
  b.setHours(23, 59, 59, 999)

  // Data uji: dua akun sementara + satu murid nyata.
  const guru = await prisma.pengguna.create({
    data: {
      nama: "Uji Guru",
      email: emailUji,
      password: await bcrypt.hash(sandiUji, 10),
      peran: "GURU",
    },
  })
  const admin = await prisma.pengguna.create({
    data: {
      nama: "Uji Admin",
      email: `uji-admin-${Date.now()}@aksara.local`,
      password: await bcrypt.hash(sandiUji, 10),
      peran: "ADMIN",
    },
  })
  idUji.push(guru.id, admin.id)

  const murid = await prisma.murid.findFirst({ select: { id: true } })
  if (!murid) throw new Error("Tidak ada murid di database")
  await prisma.absensi.deleteMany({
    where: { muridId: murid.id, tanggal: { gte: a, lte: b } },
  })

  const hdrGuru = { Authorization: `Bearer ${tandaPengguna(guru.id, "GURU")}` }
  const hdrAdmin = { Authorization: `Bearer ${tandaPengguna(admin.id, "ADMIN")}` }

  console.log("\n[1] Aturan absensi")
  const post1 = await panggil("POST", "/api/absensi", hdrGuru, {
    muridId: murid.id,
    status: "HADIR",
  })
  cek("POST pertama 201", post1.status === 201, `status=${post1.status}`)

  const post2 = await panggil("POST", "/api/absensi", hdrGuru, {
    muridId: murid.id,
    status: "IZIN",
  })
  cek(
    "POST duplikat 409 + nama pencatat",
    post2.status === 409 && typeof post2.data?.pencatat === "string",
    `status=${post2.status} pencatat=${post2.data?.pencatat}`,
  )

  const patchGuru = await panggil("PATCH", `/api/absensi/${post1.data.data.id}`, hdrGuru, {
    status: "SAKIT",
  })
  cek("PATCH oleh guru 403", patchGuru.status === 403, `status=${patchGuru.status}`)

  const patchAdmin = await panggil("PATCH", `/api/absensi/${post1.data.data.id}`, hdrAdmin, {
    status: "SAKIT",
  })
  cek(
    "PATCH oleh admin 200",
    patchAdmin.status === 200 && patchAdmin.data?.data?.status === "SAKIT",
    `status=${patchAdmin.status}`,
  )

  console.log("\n[2] Balapan dua POST bersamaan")
  await prisma.absensi.deleteMany({
    where: { muridId: murid.id, tanggal: { gte: a, lte: b } },
  })
  const balapan = await Promise.all(
    [1, 2].map(() =>
      panggil("POST", "/api/absensi", hdrGuru, { muridId: murid.id, status: "HADIR" }),
    ),
  )
  const baris = await prisma.absensi.count({
    where: { muridId: murid.id, tanggal: { gte: a, lte: b } },
  })
  cek(
    "hanya satu 201 dan satu baris di DB",
    balapan.filter((r) => r.status === 201).length === 1 && baris === 1,
    `status=[${balapan.map((r) => r.status).join(",")}] baris=${baris}`,
  )

  console.log("\n[3] Batasan unik di database")
  const contoh = await prisma.absensi.findFirst({
    where: { muridId: murid.id, tanggal: { gte: a, lte: b } },
    select: { tanggal: true },
  })
  const sebelum = await prisma.absensi.count()
  let kodeDb = null
  let pesanDb = ""
  try {
    await prisma.$executeRawUnsafe(
      'INSERT INTO "Absensi" (id, "tanggal", "muridId", "guruId", status) VALUES (gen_random_uuid(), $1, $2, $3, $4::"StatusAbsensi")',
      contoh.tanggal,
      murid.id,
      null,
      "HADIR",
    )
  } catch (e) {
    kodeDb = e.meta?.code ?? e.code
    pesanDb = e.meta?.message ?? e.message ?? ""
  }
  const sesudah = await prisma.absensi.count()
  cek(
    "insert duplikat langsung ditolak unique index",
    kodeDb === "23505" && sesudah === sebelum,
    `code=${kodeDb} baris ${sebelum}->${sesudah} pesan=${pesanDb.split("\n")[0]}`,
  )

  console.log("\n[4] Daftar hari ini")
  const hariIni = await panggil("GET", "/api/absensi?hariIni=1", hdrGuru)
  const semua = hariIni.data ?? []
  const diLuar = semua.filter((r) => {
    const t = new Date(r.tanggal)
    return t < a || t > b
  })
  cek(
    "GET ?hariIni=1 hanya hari ini",
    hariIni.status === 200 && diLuar.length === 0,
    `status=${hariIni.status} jumlah=${semua.length} luar=${diLuar.length}`,
  )

  console.log("\n[5] Auth")
  const emailSalah = await panggil(
    "POST",
    "/api/auth/login",
    {},
    {
      email: "tidak-ada@contoh.com",
      password: "salah1234",
    },
  )
  cek(
    "email tidak terdaftar -> 401 generik",
    emailSalah.status === 401 && emailSalah.data?.message === "Email atau password salah",
    `status=${emailSalah.status}`,
  )

  const sandiSalah = await panggil(
    "POST",
    "/api/auth/login",
    {},
    {
      email: emailUji,
      password: "salah1234",
    },
  )
  cek(
    "password salah -> 401 generik",
    sandiSalah.status === 401 && sandiSalah.data?.message === "Email atau password salah",
    `status=${sandiSalah.status}`,
  )

  const login = await panggil(
    "POST",
    "/api/auth/login",
    {},
    {
      email: emailUji,
      password: sandiUji,
    },
  )
  const user = login.data?.user ?? {}
  const kunci = Object.keys(user).sort().join(",")
  cek(
    "respons login hanya field publik",
    login.status === 200 && kunci === "email,id,nama,noHp,peran",
    `status=${login.status} keys=${kunci}`,
  )

  const me = await panggil("GET", "/api/me", {
    Authorization: `Bearer ${login.data.token}`,
  })
  const kunciMe = Object.keys(me.data?.user ?? {})
    .sort()
    .join(",")
  cek(
    "respons /api/me hanya field publik",
    me.status === 200 && kunciMe === "email,id,nama,noHp,peran",
    `status=${me.status} keys=${kunciMe}`,
  )

  console.log("\n[6] Penjaga lintas situs (CSRF)")
  const lintasSitus = await panggil(
    "POST",
    "/api/absensi",
    { ...hdrGuru, "Sec-Fetch-Site": "cross-site" },
    { muridId: murid.id, status: "HADIR" },
  )
  cek("request cross-site ditolak 403", lintasSitus.status === 403, `status=${lintasSitus.status}`)

  const samaAsal = await panggil(
    "POST",
    "/api/absensi",
    { ...hdrGuru, "Sec-Fetch-Site": "same-origin" },
    { muridId: murid.id, status: "HADIR" },
  )
  cek(
    "request same-origin tetap diterima",
    samaAsal.status === 201 || samaAsal.status === 409,
    `status=${samaAsal.status}`,
  )

  console.log("\n[7] Filter & ringkasan di server")
  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
      2,
      "0",
    )}`
  const hariISO = iso(new Date())

  const rentang = await panggil(
    "GET",
    `/api/absensi?tanggalMulai=${hariISO}&tanggalSelesai=${hariISO}&batas=50`,
    hdrGuru,
  )
  const diRentang = (rentang.data ?? []).filter((r) => {
    const t = new Date(r.tanggal)
    return t >= a && t <= b
  })
  cek(
    "rentang tanggal menyaring dengan benar",
    rentang.status === 200 && diRentang.length === (rentang.data ?? []).length,
    `status=${rentang.status} jumlah=${(rentang.data ?? []).length}`,
  )

  const rentangKosong = await panggil(
    "GET",
    "/api/absensi?tanggalMulai=2000-01-01&tanggalSelesai=2000-01-02",
    hdrGuru,
  )
  cek(
    "rentang di luar data mengembalikan array kosong",
    rentangKosong.status === 200 && (rentangKosong.data ?? []).length === 0,
    `status=${rentangKosong.status} jumlah=${(rentangKosong.data ?? []).length}`,
  )

  const muridKelas = await panggil("GET", "/api/murid?kelas=CALISTUNG", hdrGuru)
  const semuaCalistung = (muridKelas.data ?? []).every((m) => m.kelas === "CALISTUNG")
  cek(
    "filter kelas murid di server",
    muridKelas.status === 200 && semuaCalistung,
    `status=${muridKelas.status} jumlah=${(muridKelas.data ?? []).length}`,
  )

  const ringkasan = await panggil("GET", "/api/murid/ringkasan", hdrGuru)
  cek(
    "ringkasan murid berisi total & perKelas",
    ringkasan.status === 200 &&
      typeof ringkasan.data?.total === "number" &&
      ringkasan.data?.perKelas &&
      typeof ringkasan.data.perKelas === "object",
    `status=${ringkasan.status} total=${ringkasan.data?.total}`,
  )

  const absenGuru = await panggil("GET", "/api/absensi-guru", hdrGuru)
  cek(
    "absensi guru membalas { data, total }",
    absenGuru.status === 200 &&
      Array.isArray(absenGuru.data?.data) &&
      typeof absenGuru.data?.total === "number",
    `status=${absenGuru.status} total=${absenGuru.data?.total}`,
  )

  const muridPaginated = await panggil("GET", "/api/murid?mulai=0&batas=5", hdrGuru)
  cek(
    "paginasi murid di server (batas 5)",
    muridPaginated.status === 200 && (muridPaginated.data ?? []).length <= 5,
    `status=${muridPaginated.status} jumlah=${(muridPaginated.data ?? []).length}`,
  )

  const ringkasanFilter = await panggil("GET", "/api/murid/ringkasan?kelas=CALISTUNG", hdrGuru)
  const totalCalistung = ringkasanFilter.data?.perKelas?.CALISTUNG ?? 0
  cek(
    "ringkasan mengikuti filter kelas",
    ringkasanFilter.status === 200 && ringkasanFilter.data?.total === totalCalistung,
    `status=${ringkasanFilter.status} total=${ringkasanFilter.data?.total} calistung=${totalCalistung}`,
  )

  // Bersih-bersih
  await prisma.absensi.deleteMany({
    where: { muridId: murid.id, tanggal: { gte: a, lte: b } },
  })
  await prisma.pengguna.deleteMany({ where: { id: { in: idUji } } })

  const gagal = hasil.filter((h) => !h.ok)
  console.log(`\nRingkasan: ${hasil.length - gagal.length}/${hasil.length} lolos`)
  if (gagal.length > 0) {
    console.error("Yang gagal:", gagal.map((h) => h.nama).join("; "))
    process.exitCode = 1
  }
}

main()
  .catch((e) => {
    console.error("ERROR UJI:", e)
    process.exitCode = 1
  })
  .finally(bersihkan)
