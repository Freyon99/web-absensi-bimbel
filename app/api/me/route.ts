import { getUserFromHeader } from "@/lib/get-user"
import { signToken } from "@/lib/jwt"
import { ambilToken, setCookieToken } from "@/lib/api-guard"
import { jwtVerify } from "jose"

// Refresh sesi: terima cookie HttpOnly (atau header), terbitkan token baru,
// dan perbarui cookie agar masa berlakunya meluncur.
export async function GET(req: Request) {
  try {
    const tokenLama = ambilToken(req)
    if (!tokenLama) throw new Error("Unauthorized")

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(tokenLama, secret)

    const id = payload.id as string
    const role = (payload.peran || payload.role) as "ADMIN" | "GURU"

    const safeUser = await getUserFromHeader()
    const tokenBaru = signToken({ id, role })

    const res = Response.json({ token: tokenBaru, user: safeUser })
    setCookieToken(req, res, tokenBaru)
    return res
  } catch (error) {
    console.error("DETAIL ERROR ME:", error)
    return Response.json({ message: "Unauthorized" }, { status: 401 })
  }
}
