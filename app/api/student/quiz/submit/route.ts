import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../lib/db"
import { verifyToken, extractToken } from "../../../lib/auth"

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

    const { quizId, answers } = await request.json()

    let totalScore = 0
    let totalPoints = 0

    for (const answer of answers) {
      const questions = await sql(`SELECT * FROM quiz_questions WHERE id = $1`, [answer.questionId])

      const question = questions[0]
      totalPoints += question.points

      if (answer.selectedOptionId) {
        const options = await sql(`SELECT is_correct FROM quiz_options WHERE id = $1`, [answer.selectedOptionId])

        if (options[0]?.is_correct) {
          totalScore += question.points
        }
      }
    }

    const passingScore = await sql(`SELECT passing_score FROM quizzes WHERE id = $1`, [quizId])

    const passed = (totalScore / totalPoints) * 100 >= passingScore[0].passing_score

    const submission = await sql(
      `INSERT INTO quiz_submissions (student_id, quiz_id, score, passed)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [payload.userId, quizId, totalScore, passed],
    )

    return NextResponse.json({
      score: totalScore,
      totalPoints,
      percentage: (totalScore / totalPoints) * 100,
      passed,
      submission: submission[0],
    })
  } catch (error) {
    console.error("[v0] Error submitting quiz:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
