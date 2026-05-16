import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  id: string
  role: "ADMIN" | "GURU"
}

export function verifyAuth(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}