import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params

    const lessons = await sql(
      `SELECT l.*, cm.title as module_title, cm.order_index as module_order
      FROM lessons l
      JOIN course_modules cm ON l.module_id = cm.id
      WHERE cm.course_id = $1
      ORDER BY cm.order_index ASC, l.order_index ASC`,
      [id],
    )

    return NextResponse.json(lessons)
  } catch (error) {
    console.error("[v0] Error fetching lessons:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}
