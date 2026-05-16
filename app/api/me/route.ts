import { getUserFromHeader } from "@/lib/get-user"

export async function GET() {
  try {
    const user = await getUserFromHeader()

    return Response.json(user)

  } catch (error) {
    return Response.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }
}