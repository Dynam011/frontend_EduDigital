import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../lib/db"
import { verifyToken, extractToken } from "../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 })
    }

    const discussions = await sql(
      `SELECT d.*, u.first_name, u.last_name, u.avatar_url,
        COUNT(DISTINCT dr.id) as reply_count
      FROM discussions d
      JOIN users u ON d.author_id = u.id
      LEFT JOIN discussion_replies dr ON d.id = dr.discussion_id
      WHERE d.course_id = $1
      GROUP BY d.id, u.id
      ORDER BY d.is_pinned DESC, d.created_at DESC`,
      [courseId],
    )

    return NextResponse.json(discussions)
  } catch (error) {
    console.error("[v0] Error fetching discussions:", error)
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 })
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

    const { courseId, title, content } = await request.json()

    const discussion = await sql(
      `INSERT INTO discussions (course_id, author_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [courseId, payload.userId, title, content],
    )

    return NextResponse.json(discussion[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating discussion:", error)
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 })
  }
}
