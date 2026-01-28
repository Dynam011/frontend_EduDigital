import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType } = body

    // Mock authentication - replace with your actual auth logic
    // In production, verify against database and hash passwords
    const token = Buffer.from(`${email}:${userType}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      user: {
        email,
        userType,
        id: Math.random().toString(36).substr(2, 9),
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 })
  }
}
