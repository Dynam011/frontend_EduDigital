import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../lib/db"
import { verifyToken, extractToken } from "../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await sql(
      `SELECT id, email, first_name, last_name, user_type, avatar_url, bio, specialties, created_at
      FROM users WHERE id = $1`,
      [payload.userId],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { first_name, last_name, bio, avatar_url, specialties } = await request.json()

    const user = await sql(
      `UPDATE users 
      SET first_name = $1, last_name = $2, bio = $3, avatar_url = $4, specialties = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, email, first_name, last_name, user_type, avatar_url, bio, specialties`,
      [first_name, last_name, bio, avatar_url, specialties, payload.userId],
    )

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
