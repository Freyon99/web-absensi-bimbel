import { describe, expect, it } from "vitest"
import { ambilIpClient } from "../lib/ip"

function req(headers: Record<string, string>) {
  return new Request("http://localhost:3000/api/x", { headers })
}

describe("ambilIpClient", () => {
  it("mengambil nilai paling kanan dari x-forwarded-for", () => {
    const ip = ambilIpClient(req({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" }))

    expect(ip).toBe("10.0.0.2")
  })

  it("memakai x-real-ip bila x-forwarded-for absen", () => {
    expect(ambilIpClient(req({ "x-real-ip": "198.51.100.9" }))).toBe("198.51.100.9")
  })

  it("mengembalikan unknown bila tidak ada header", () => {
    expect(ambilIpClient(req({}))).toBe("unknown")
  })
})
