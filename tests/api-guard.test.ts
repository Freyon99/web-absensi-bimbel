import { beforeAll, describe, expect, it } from "vitest"
import { SignJWT } from "jose"
import {
  ambilToken,
  AutentikasiError,
  headerHapusCookieToken,
  opsiCookie,
  setCookieToken,
  wajibAdmin,
  wajibAuth,
} from "../lib/api-guard"

const SECRET = "kunci-rahasia-pengujian-yang-cukup-panjang-32+"

beforeAll(() => {
  process.env.JWT_SECRET = SECRET
})

async function tandaTangan(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(SECRET))
}

function req(url: string, init?: RequestInit) {
  return new Request(url, init)
}

describe("wajibAuth", () => {
  it("mengembalikan payload dari token di header", async () => {
    const token = await tandaTangan({ id: "u1", peran: "ADMIN" })

    const payload = await wajibAuth(
      req("http://localhost/api/x", { headers: { authorization: `Bearer ${token}` } }),
    )

    expect(payload).toEqual({ id: "u1", role: "ADMIN" })
  })

  it("menerima token dari cookie HttpOnly", async () => {
    const token = await tandaTangan({ id: "u2", role: "GURU" })

    const payload = await wajibAuth(
      req("http://localhost/api/x", { headers: { cookie: `token=${encodeURIComponent(token)}` } }),
    )

    expect(payload).toEqual({ id: "u2", role: "GURU" })
  })

  it("401 bila token tidak ada", async () => {
    await expect(wajibAuth(req("http://localhost/api/x"))).rejects.toBeInstanceOf(AutentikasiError)
  })

  it("401 bila token tidak valid", async () => {
    await expect(
      wajibAuth(
        req("http://localhost/api/x", { headers: { authorization: "Bearer abc.def.ghi" } }),
      ),
    ).rejects.toMatchObject({ status: 401 })
  })

  it("401 bila peran tidak dikenal", async () => {
    const token = await tandaTangan({ id: "u3", peran: "ROOT" })

    await expect(
      wajibAuth(req("http://localhost/api/x", { headers: { authorization: `Bearer ${token}` } })),
    ).rejects.toMatchObject({ status: 401 })
  })

  it("403 untuk request lintas situs yang mengubah data", async () => {
    const token = await tandaTangan({ id: "u4", peran: "GURU" })

    await expect(
      wajibAuth(
        req("http://localhost/api/x", {
          method: "POST",
          headers: { cookie: `token=${token}`, "sec-fetch-site": "cross-site" },
        }),
      ),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe("wajibAdmin", () => {
  it("403 bila peran bukan ADMIN", async () => {
    const token = await tandaTangan({ id: "u5", peran: "GURU" })

    await expect(
      wajibAdmin(req("http://localhost/api/x", { headers: { authorization: `Bearer ${token}` } })),
    ).rejects.toMatchObject({ status: 403 })
  })
})

describe("ambilToken", () => {
  it("memprioritaskan header Authorization", () => {
    const r = req("http://localhost/x", {
      headers: { authorization: "Bearer dari-header", cookie: "token=dari-cookie" },
    })

    expect(ambilToken(r)).toBe("dari-header")
  })

  it("jatuh ke cookie bila header absen", () => {
    expect(
      ambilToken(req("http://localhost/x", { headers: { cookie: "token=dari-cookie" } })),
    ).toBe("dari-cookie")
  })
})

describe("cookie sesi", () => {
  it("opsiCookie menambahkan Secure di belakang proxy https", () => {
    expect(
      opsiCookie(req("http://localhost/x", { headers: { "x-forwarded-proto": "https" } })),
    ).toBe("; Secure")
    expect(opsiCookie(req("http://localhost/x"))).toBe("")
  })

  it("setCookieToken memasang cookie HttpOnly SameSite=Strict", () => {
    const res = new Response()

    setCookieToken(req("http://localhost/x"), res, "abc")

    const sc = res.headers.get("set-cookie")
    expect(sc).toContain("token=abc")
    expect(sc).toContain("HttpOnly")
    expect(sc).toContain("SameSite=Strict")
    expect(sc).toContain("Max-Age=28800")
  })

  it("headerHapusCookieToken menghapus cookie", () => {
    const h = headerHapusCookieToken(req("http://localhost/x"))

    expect(h).toContain("token=;")
    expect(h).toContain("Max-Age=0")
  })
})
