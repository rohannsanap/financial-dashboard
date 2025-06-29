import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import type { Transaction, CreateTransactionInput } from "@/lib/models/Transaction"

export class TransactionService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<Transaction>("transactions")
  }

  async createTransaction(transactionData: CreateTransactionInput): Promise<Transaction> {
    const collection = await this.getCollection()

    const newTransaction: Omit<Transaction, "_id"> = {
      ...transactionData,
      currency: transactionData.currency || "USD",
      tags: transactionData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newTransaction)
    return { ...newTransaction, _id: result.insertedId }
  }

  async getTransactionsByUserId(
    userId: string | ObjectId,
    options: {
      page?: number
      limit?: number
      search?: string
      status?: string
      category?: string
      startDate?: Date
      endDate?: Date
      sortBy?: string
      sortOrder?: "asc" | "desc"
    } = {},
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const collection = await this.getCollection()
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId

    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
    } = options

    // Build query
    const query: any = { userId: objectId }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { merchant: { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      query.status = status
    }

    if (category && category !== "all") {
      query.category = category
    }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = startDate
      if (endDate) query.date.$lte = endDate
    }

    // Get total count
    const total = await collection.countDocuments(query)

    // Get transactions with pagination and sorting
    const transactions = await collection
      .find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return { transactions, total }
  }

  async getTransactionById(id: string | ObjectId): Promise<Transaction | null> {
    const collection = await this.getCollection()
    const objectId = typeof id === "string" ? new ObjectId(id) : id
    return await collection.findOne({ _id: objectId })
  }

  async updateTransaction(id: string | ObjectId, updates: Partial<Transaction>): Promise<Transaction | null> {
    const collection = await this.getCollection()
    const objectId = typeof id === "string" ? new ObjectId(id) : id

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result
  }

  async deleteTransaction(id: string | ObjectId): Promise<boolean> {
    const collection = await this.getCollection()
    const objectId = typeof id === "string" ? new ObjectId(id) : id

    const result = await collection.deleteOne({ _id: objectId })
    return result.deletedCount > 0
  }

  async getAnalytics(userId: string | ObjectId, period: "week" | "month" | "year" = "month") {
    const collection = await this.getCollection()
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId

    const now = new Date()
    let startDate: Date

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const pipeline = [
      {
        $match: {
          userId: objectId,
          date: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
            },
          },
          transactionCount: { $sum: 1 },
          avgTransactionAmount: { $avg: "$amount" },
        },
      },
    ]

    const [analytics] = await collection.aggregate(pipeline).toArray()

    if (!analytics) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
        avgTransactionAmount: 0,
      }
    }

    return {
      ...analytics,
      balance: analytics.totalIncome - analytics.totalExpenses,
    }
  }

  async getCategoryBreakdown(userId: string | ObjectId, period: "month" | "year" = "month") {
    const collection = await this.getCollection()
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId

    const now = new Date()
    const startDate =
      period === "year" ? new Date(now.getFullYear(), 0, 1) : new Date(now.getFullYear(), now.getMonth(), 1)

    const pipeline = [
      {
        $match: {
          userId: objectId,
          date: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: { $abs: "$amount" } },
          count: { $sum: 1 },
          type: { $first: "$type" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]

    return await collection.aggregate(pipeline).toArray()
  }
}

export const transactionService = new TransactionService()
