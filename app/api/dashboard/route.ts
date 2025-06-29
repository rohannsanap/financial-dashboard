import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { transactionService } from "@/lib/services/transactionService"
import { withRateLimit, apiLimiter } from "@/lib/middleware/rateLimiter"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (error) {
    return null
  }
}

async function dashboardHandler(request: NextRequest) {
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

    // Get user's transactions and analytics
    const { transactions } = await transactionService.getTransactionsByUserId(decoded.userId, {
      limit: 50,
      sortBy: "date",
      sortOrder: "desc",
    })

    const analytics = await transactionService.getAnalytics(decoded.userId, "month")
    const categoryBreakdown = await transactionService.getCategoryBreakdown(decoded.userId, "month")

    // Generate chart data for the last 12 months
    const chartData = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear()
      })

      const income = monthTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

      const expenses = Math.abs(monthTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))

      chartData.push({
        month: monthName,
        income,
        expenses,
      })
    }

    const dashboardData = {
      metrics: {
        balance: Math.round(analytics.balance || 0),
        revenue: Math.round(analytics.totalIncome || 0),
        expenses: Math.round(analytics.totalExpenses || 0),
        savings: Math.round((analytics.balance || 0) * 0.2),
      },
      transactions,
      chartData,
      categoryBreakdown,
      analytics: {
        ...analytics,
        transactionCount: analytics.transactionCount || 0,
        avgTransactionAmount: Math.round(analytics.avgTransactionAmount || 0),
      },
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(apiLimiter)(dashboardHandler)
