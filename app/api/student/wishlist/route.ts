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

    const wishlist = await sql(
      `SELECT w.*, c.title, c.image_url, c.price, c.level
      FROM wishlist w
      JOIN courses c ON w.course_id = c.id
      WHERE w.student_id = $1
      ORDER BY w.added_at DESC`,
      [payload.userId],
    )

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error("[v0] Error fetching wishlist:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { courseId } = await request.json()

    const item = await sql(
      `INSERT INTO wishlist (student_id, course_id)
      VALUES ($1, $2)
      RETURNING *`,
      [payload.userId, courseId],
    )

    return NextResponse.json(item[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding to wishlist:", error)
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}
