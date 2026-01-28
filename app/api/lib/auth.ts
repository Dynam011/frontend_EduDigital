import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export function generateToken(userId: string, userType: string) {
  return jwt.sign({ userId, userType }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; userType: string }
  } catch (error) {
    return null
  }
}

export function extractToken(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) return null
  return authHeader.slice(7)
}
