import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { transactionService } from "@/lib/services/transactionService"
import { userService } from "@/lib/services/userService"
import { socketManager } from "@/lib/websocket/socketManager"
import { withRateLimit, apiLimiter } from "@/lib/middleware/rateLimiter"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Lazy load email service to avoid build-time issues
const getEmailService = async () => {
  try {
    const { emailService } = await import("@/lib/services/emailService")
    return emailService
  } catch (error) {
    console.warn("Email service not available:", error)
    return null
  }
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

// GET /api/transactions - Get user's transactions with filtering and pagination
async function getTransactions(request: NextRequest) {
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
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const category = searchParams.get("category") || "all"
    const sortBy = searchParams.get("sortBy") || "date"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"

    const result = await transactionService.getTransactionsByUserId(decoded.userId, {
      page,
      limit,
      search,
      status: status !== "all" ? status : undefined,
      category: category !== "all" ? category : undefined,
      sortBy,
      sortOrder,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/transactions - Create new transaction
async function createTransaction(request: NextRequest) {
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

    const transactionData = await request.json()

    // Create transaction
    const transaction = await transactionService.createTransaction({
      ...transactionData,
      userId: decoded.userId,
    })

    // Get user for notifications
    const user = await userService.getUserById(decoded.userId)

    // Send real-time update (simplified)
    socketManager.emitTransactionUpdate(decoded.userId, transaction)

    // Send email notification if enabled and transaction is large
    if (user?.preferences.notifications.transactionAlerts && Math.abs(transaction.amount) > 1000) {
      try {
        const emailService = await getEmailService()
        if (emailService) {
          await emailService.sendTransactionAlert(user.email, transaction, user.name)
        }
      } catch (emailError) {
        console.warn("Failed to send transaction alert email:", emailError)
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(apiLimiter)(getTransactions)
export const POST = withRateLimit(apiLimiter)(createTransaction)
