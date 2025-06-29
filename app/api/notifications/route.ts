import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { notificationService } from "@/lib/services/notificationService"
import { withRateLimit, apiLimiter } from "@/lib/middleware/rateLimiter"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

// GET /api/notifications - Get user's notifications
async function getNotifications(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const result = await notificationService.getUserNotifications(decoded.userId, {
      page,
      limit,
      unreadOnly,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/notifications/mark-read - Mark notifications as read
async function markAsRead(request: NextRequest) {
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

    const { notificationIds, markAll } = await request.json()

    if (markAll) {
      const count = await notificationService.markAllAsRead(decoded.userId)
      return NextResponse.json({ message: `Marked ${count} notifications as read` })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      let count = 0
      for (const id of notificationIds) {
        const success = await notificationService.markAsRead(id)
        if (success) count++
      }
      return NextResponse.json({ message: `Marked ${count} notifications as read` })
    } else {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }
  } catch (error) {
    console.error("Mark notifications as read error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(apiLimiter)(getNotifications)
export const PUT = withRateLimit(apiLimiter)(markAsRead)
