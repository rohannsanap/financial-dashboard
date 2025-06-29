import { describe, it, expect, beforeEach } from "@jest/globals"
import { transactionService } from "@/lib/services/transactionService"
import { ObjectId } from "mongodb"
import jest from "jest"

// Mock MongoDB
jest.mock("@/lib/mongodb", () => ({
  getDatabase: jest.fn(() => ({
    collection: jest.fn(() => ({
      insertOne: jest.fn(),
      find: jest.fn(() => ({
        sort: jest.fn(() => ({
          skip: jest.fn(() => ({
            limit: jest.fn(() => ({
              toArray: jest.fn(),
            })),
          })),
        })),
      })),
      countDocuments: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      aggregate: jest.fn(() => ({
        toArray: jest.fn(),
      })),
    })),
  })),
}))

describe("Transaction Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Transaction Creation", () => {
    it("should create a new transaction", async () => {
      const mockCollection = {
        insertOne: jest.fn().mockResolvedValue({ insertedId: new ObjectId() }),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const transactionData = {
        userId: new ObjectId(),
        name: "Test Transaction",
        email: "test@example.com",
        amount: 100.5,
        date: new Date(),
        status: "completed" as const,
        category: "Food",
        description: "Lunch",
        type: "expense" as const,
        paymentMethod: "card" as const,
      }

      const result = await transactionService.createTransaction(transactionData)

      expect(mockCollection.insertOne).toHaveBeenCalled()
      expect(result.amount).toBe(transactionData.amount)
      expect(result.category).toBe(transactionData.category)
      expect(result.currency).toBe("USD") // Default currency
    })
  })

  describe("Transaction Retrieval", () => {
    it("should get transactions by user ID with pagination", async () => {
      const mockTransactions = [
        {
          _id: new ObjectId(),
          userId: new ObjectId(),
          name: "Transaction 1",
          amount: 100,
          date: new Date(),
          status: "completed",
          category: "Food",
        },
      ]

      const mockCollection = {
        countDocuments: jest.fn().mockResolvedValue(1),
        find: jest.fn(() => ({
          sort: jest.fn(() => ({
            skip: jest.fn(() => ({
              limit: jest.fn(() => ({
                toArray: jest.fn().mockResolvedValue(mockTransactions),
              })),
            })),
          })),
        })),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const userId = new ObjectId()
      const result = await transactionService.getTransactionsByUserId(userId, {
        page: 1,
        limit: 10,
      })

      expect(result.transactions).toEqual(mockTransactions)
      expect(result.total).toBe(1)
      expect(mockCollection.countDocuments).toHaveBeenCalled()
    })

    it("should filter transactions by search term", async () => {
      const mockCollection = {
        countDocuments: jest.fn().mockResolvedValue(0),
        find: jest.fn(() => ({
          sort: jest.fn(() => ({
            skip: jest.fn(() => ({
              limit: jest.fn(() => ({
                toArray: jest.fn().mockResolvedValue([]),
              })),
            })),
          })),
        })),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const userId = new ObjectId()
      await transactionService.getTransactionsByUserId(userId, {
        search: "coffee",
      })

      expect(mockCollection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { name: { $regex: "coffee", $options: "i" } },
            { email: { $regex: "coffee", $options: "i" } },
            { description: { $regex: "coffee", $options: "i" } },
            { merchant: { $regex: "coffee", $options: "i" } },
          ]),
        }),
      )
    })
  })

  describe("Analytics", () => {
    it("should calculate user analytics", async () => {
      const mockAnalytics = [
        {
          _id: null,
          totalIncome: 1000,
          totalExpenses: 500,
          transactionCount: 10,
          avgTransactionAmount: 50,
        },
      ]

      const mockCollection = {
        aggregate: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue(mockAnalytics),
        })),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const userId = new ObjectId()
      const result = await transactionService.getAnalytics(userId, "month")

      expect(result.totalIncome).toBe(1000)
      expect(result.totalExpenses).toBe(500)
      expect(result.balance).toBe(500)
      expect(result.transactionCount).toBe(10)
    })

    it("should return default analytics for no data", async () => {
      const mockCollection = {
        aggregate: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue([]),
        })),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const userId = new ObjectId()
      const result = await transactionService.getAnalytics(userId, "month")

      expect(result.totalIncome).toBe(0)
      expect(result.totalExpenses).toBe(0)
      expect(result.balance).toBe(0)
      expect(result.transactionCount).toBe(0)
    })
  })
})
