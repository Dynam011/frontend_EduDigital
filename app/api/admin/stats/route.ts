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
    if (!payload || payload.userType !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const totalUsers = await sql(`SELECT COUNT(*) as count FROM users`)
    const totalCourses = await sql(`SELECT COUNT(*) as count FROM courses WHERE published = true`)
    const totalEnrollments = await sql(`SELECT COUNT(*) as count FROM enrollments`)
    const totalRevenue = await sql(
      `SELECT COALESCE(SUM(c.price), 0) as total FROM enrollments e JOIN courses c ON e.course_id = c.id`,
    )

    return NextResponse.json({
      totalUsers: totalUsers[0].count,
      totalCourses: totalCourses[0].count,
      totalEnrollments: totalEnrollments[0].count,
      totalRevenue: totalRevenue[0].total,
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
