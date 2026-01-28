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
    if (!payload || payload.userType !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const courses = await sql(
      `SELECT c.*,
        COUNT(DISTINCT e.id) as student_count,
        COALESCE(SUM(CASE WHEN e.completed THEN 1 ELSE 0 END), 0) as completed_count
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.teacher_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [payload.userId],
    )

    return NextResponse.json(courses)
  } catch (error) {
    console.error("[v0] Error fetching teacher courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.userType !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { title, description, category, level, price, duration_hours } = await request.json()

    const course = await sql(
      `INSERT INTO courses (teacher_id, title, description, category, level, price, duration_hours)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [payload.userId, title, description, category, level, price, duration_hours],
    )

    return NextResponse.json(course[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating course:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
