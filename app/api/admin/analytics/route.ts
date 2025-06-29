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

// GET /api/admin/analytics - Get system analytics (admin only)
async function getSystemAnalytics(request: NextRequest) {
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

    const db = await getDatabase()

    // User analytics
    const userStats = await db
      .collection("users")
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

    // Transaction analytics
    const transactionStats = await db
      .collection("transactions")
      .aggregate([
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalVolume: { $sum: { $abs: "$amount" } },
            avgTransactionAmount: { $avg: { $abs: "$amount" } },
            completedTransactions: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            pendingTransactions: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
            failedTransactions: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          },
        },
      ])
      .toArray()

    // Monthly growth
    const monthlyGrowth = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            newUsers: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
        {
          $limit: 12,
        },
      ])
      .toArray()

    // Transaction volume by month
    const monthlyTransactionVolume = await db
      .collection("transactions")
      .aggregate([
        {
          $match: {
            status: "completed",
            date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            volume: { $sum: { $abs: "$amount" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ])
      .toArray()

    // Top categories
    const topCategories = await db
      .collection("transactions")
      .aggregate([
        {
          $match: { status: "completed" },
        },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: { $abs: "$amount" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { totalAmount: -1 },
        },
        {
          $limit: 10,
        },
      ])
      .toArray()

    return NextResponse.json({
      userStats: userStats[0] || {},
      transactionStats: transactionStats[0] || {},
      monthlyGrowth,
      monthlyTransactionVolume,
      topCategories,
    })
  } catch (error) {
    console.error("Get system analytics error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const GET = withRateLimit(apiLimiter)(getSystemAnalytics)
