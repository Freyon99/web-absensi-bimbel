import  prisma  from "@/lib/prisma"
import { comparePassword } from "@/lib/hash"
import { signToken } from "@/lib/jwt"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const data = loginSchema.parse(body)

    const user = await prisma.Pengguna.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      return Response.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      )
    }

    const isValidPassword = await comparePassword(
      data.password,
      user.password
    )

    if (!isValidPassword) {
      return Response.json(
        {
          message: "Password salah",
        },
        {
          status: 401,
        }
      )
    }

    const token = signToken({
      id: user.id,
      role: user.peran,
    })

    return Response.json({
      token,
      user,
    })

  } catch (error) {
    console.log(error)

    return Response.json(
      {
        message: "Terjadi kesalahan",
      },
      {
        status: 500,
      }
    )
  }
  console.log(prisma)
}