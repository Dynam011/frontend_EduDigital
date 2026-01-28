import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, userType } = body

    const token = Buffer.from(`${email}:${userType}:${Date.now()}`).toString("base64")
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      firstName,
      lastName,
      userType,
      createdAt: new Date(),
    }

    return NextResponse.json({
      token,
      user: newUser,
    })
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 })
  }
}
