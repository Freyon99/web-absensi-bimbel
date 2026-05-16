import { headers } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  id: string
  role: "ADMIN" | "GURU"
}

export async function getUserFromHeader() {
  const headersList = await headers()

  const authorization = headersList.get("authorization")

  if (!authorization) {
    throw new Error("Unauthorized")
  }

  const token = authorization.split(" ")[1]

  if (!token) {
    throw new Error("Token tidak ditemukan")
  }

  const decoded = jwt.verify(
    token,
    JWT_SECRET
  ) as JwtPayload

  return decoded
}