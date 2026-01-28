import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const level = searchParams.get("level")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    let query = `
      SELECT c.*, u.first_name, u.last_name,
        COUNT(DISTINCT e.id) as student_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.published = true
    `

    const params = []

    if (category) {
      query += ` AND c.category = $${params.length + 1}`
      params.push(category)
    }

    if (level) {
      query += ` AND c.level = $${params.length + 1}`
      params.push(level)
    }

    query += ` GROUP BY c.id, u.id
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const courses = await sql(query, params)

    return NextResponse.json(courses)
  } catch (error) {
    console.error("[v0] Error fetching courses:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
