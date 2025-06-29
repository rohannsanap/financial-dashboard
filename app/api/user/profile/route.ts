import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { userService } from "@/lib/services/userService"
import { withRateLimit, apiLimiter } from "@/lib/middleware/rateLimiter"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

// GET /api/user/profile - Get user profile
async function getProfile(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }

    const user = await userService.getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Remove sensitive data
    const { password, emailVerificationToken, resetPasswordToken, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/user/profile - Update user profile
async function updateProfile(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }

    const updates = await request.json()

    const updatedUser = await userService.updateUser(decoded.userId, updates)
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Remove sensitive data
    const { password, emailVerificationToken, resetPasswordToken, ...safeUser } = updatedUser

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(apiLimiter)(getProfile)
export const PUT = withRateLimit(apiLimiter)(updateProfile)
