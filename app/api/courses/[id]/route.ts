import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    const courses = await sql(
      `SELECT c.*, u.first_name, u.last_name, u.avatar_url,
        COUNT(DISTINCT e.id) as student_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.id = $1
      GROUP BY c.id, u.id`,
      [id],
    )

    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const course = courses[0]

    const modules = await sql(
      `SELECT cm.*, COUNT(DISTINCT l.id) as lesson_count
      FROM course_modules cm
      LEFT JOIN lessons l ON cm.id = l.module_id
      WHERE cm.course_id = $1
      GROUP BY cm.id
      ORDER BY cm.order_index ASC`,
      [id],
    )

    return NextResponse.json({ ...course, modules })
  } catch (error) {
    console.error("[v0] Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}
