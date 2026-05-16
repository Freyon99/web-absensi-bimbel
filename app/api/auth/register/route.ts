import  prisma  from "@/lib/prisma"
import { hashPassword } from "@/lib/hash"
import { z } from "zod"

const registerSchema = z.object({
  nama: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  peran: z.enum(["ADMIN", "GURU"]),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const data = registerSchema.parse(body)

    const existingUser = await prisma.Pengguna.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingUser) {
      return Response.json(
        {
          message: "Email sudah digunakan",
        },
        {
          status: 400,
        }
      )
    }

    const hashedPassword = await hashPassword(data.password)

    const user = await prisma.Pengguna.create({
      data: {
        nama: data.nama,
        email: data.email,
        password: hashedPassword,
        peran: data.peran,
      },
    })

    return Response.json(user)

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
}