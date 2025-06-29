import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import { withRateLimit, apiLimiter } from "@/lib/middleware/rateLimiter"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

// GET /api/admin/users - Get all users (admin only)
async function getUsers(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const db = await getDatabase()
    const usersCollection = db.collection("users")

    const query: any = {}
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await usersCollection
      .find(query, { projection: { password: 0, emailVerificationToken: 0, resetPasswordToken: 0 } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await usersCollection.countDocuments(query)

    // Get user statistics
    const stats = await usersCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            verifiedUsers: { $sum: { $cond: ["$isEmailVerified", 1, 0] } },
            adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      users,
      total,
      stats: stats[0] || { totalUsers: 0, verifiedUsers: 0, adminUsers: 0 },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(apiLimiter)(getUsers)
