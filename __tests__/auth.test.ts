import { describe, it, expect, beforeEach } from "@jest/globals"
import { userService } from "@/lib/services/userService"
import bcrypt from "bcryptjs"
import jest from "jest"

// Mock MongoDB
jest.mock("@/lib/mongodb", () => ({
  getDatabase: jest.fn(() => ({
    collection: jest.fn(() => ({
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    })),
  })),
}))

describe("Authentication Service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("User Creation", () => {
    it("should create a new user with hashed password", async () => {
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: "mock-id" }),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }

      const result = await userService.createUser(userData)

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: userData.email })
      expect(mockCollection.insertOne).toHaveBeenCalled()
      expect(result.email).toBe(userData.email)
      expect(result.name).toBe(userData.name)
      expect(result.password).not.toBe(userData.password) // Should be hashed
    })

    it("should throw error if user already exists", async () => {
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue({ email: "test@example.com" }),
        insertOne: jest.fn(),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      }

      await expect(userService.createUser(userData)).rejects.toThrow("User already exists with this email")
      expect(mockCollection.insertOne).not.toHaveBeenCalled()
    })
  })

  describe("Password Verification", () => {
    it("should verify correct password", async () => {
      const plainPassword = "password123"
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      const result = await userService.verifyPassword(plainPassword, hashedPassword)
      expect(result).toBe(true)
    })

    it("should reject incorrect password", async () => {
      const plainPassword = "password123"
      const wrongPassword = "wrongpassword"
      const hashedPassword = await bcrypt.hash(plainPassword, 12)

      const result = await userService.verifyPassword(wrongPassword, hashedPassword)
      expect(result).toBe(false)
    })
  })

  describe("User Retrieval", () => {
    it("should get user by email", async () => {
      const mockUser = {
        _id: "mock-id",
        email: "test@example.com",
        name: "Test User",
      }

      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(mockUser),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const result = await userService.getUserByEmail("test@example.com")

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: "test@example.com" })
      expect(result).toEqual(mockUser)
    })

    it("should return null for non-existent user", async () => {
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(null),
      }

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      }

      require("@/lib/mongodb").getDatabase.mockResolvedValue(mockDb)

      const result = await userService.getUserByEmail("nonexistent@example.com")

      expect(result).toBeNull()
    })
  })
})
