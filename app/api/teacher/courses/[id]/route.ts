import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../lib/db"
import { verifyToken, extractToken } from "../../../lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const courses = await sql(`SELECT * FROM courses WHERE id = $1 AND teacher_id = $2`, [id, payload.userId])

    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(courses[0])
  } catch (error) {
    console.error("[v0] Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.userType !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const { title, description, category, level, price, published } = await request.json()

    const course = await sql(
      `UPDATE courses 
      SET title = $1, description = $2, category = $3, level = $4, price = $5, published = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND teacher_id = $8
      RETURNING *`,
      [title, description, category, level, price, published, id, payload.userId],
    )

    if (course.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json(course[0])
  } catch (error) {
    console.error("[v0] Error updating course:", error)
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = extractToken(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.userType !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    await sql(`DELETE FROM courses WHERE id = $1 AND teacher_id = $2`, [id, payload.userId])

    return NextResponse.json({ message: "Course deleted" })
  } catch (error) {
    console.error("[v0] Error deleting course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
