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
    if (!payload || payload.userType !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const enrollments = await sql(
      `SELECT e.*, c.title, c.image_url, c.price,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(DISTINCT l.id) as total_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN reviews r ON c.id = r.course_id
      LEFT JOIN lessons l ON c.id = l.course_id
      WHERE e.student_id = $1
      GROUP BY e.id, c.id
      ORDER BY e.enrolled_at DESC`,
      [payload.userId],
    )

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("[v0] Error fetching enrollments:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.userType !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { courseId } = await request.json()

    const enrollment = await sql(
      `INSERT INTO enrollments (student_id, course_id)
      VALUES ($1, $2)
      RETURNING *`,
      [payload.userId, courseId],
    )

    return NextResponse.json(enrollment[0], { status: 201 })
  } catch (error: any) {
    if (error.message?.includes("duplicate")) {
      return NextResponse.json({ error: "Already enrolled in this course" }, { status: 400 })
    }
    console.error("[v0] Error enrolling:", error)
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 })
  }
}
