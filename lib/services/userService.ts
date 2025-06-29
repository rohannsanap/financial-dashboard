import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import type { User, CreateUserInput, UpdateUserInput } from "@/lib/models/User"
import crypto from "crypto"

export class UserService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection<User>("users")
  }

  async createUser(userData: CreateUserInput): Promise<User> {
    const collection = await this.getCollection()

    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email })
    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex")

    const newUser: Omit<User, "_id"> = {
      ...userData,
      password: hashedPassword,
      role: "user",
      isEmailVerified: false,
      emailVerificationToken,
      preferences: {
        currency: "USD",
        notifications: {
          email: true,
          push: true,
          transactionAlerts: true,
          weeklyReports: true,
        },
        theme: "dark",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  async getUserById(id: string | ObjectId): Promise<User | null> {
    const collection = await this.getCollection()
    const objectId = typeof id === "string" ? new ObjectId(id) : id
    return await collection.findOne({ _id: objectId })
  }

  async updateUser(id: string | ObjectId, updates: UpdateUserInput): Promise<User | null> {
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

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  async updateLastLogin(id: string | ObjectId): Promise<void> {
    const collection = await this.getCollection()
    const objectId = typeof id === "string" ? new ObjectId(id) : id

    await collection.updateOne({ _id: objectId }, { $set: { lastLoginAt: new Date() } })
  }

  async verifyEmail(token: string): Promise<boolean> {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { emailVerificationToken: token },
      {
        $set: {
          isEmailVerified: true,
          updatedAt: new Date(),
        },
        $unset: { emailVerificationToken: "" },
      },
    )

    return result.modifiedCount > 0
  }

  async generatePasswordResetToken(email: string): Promise<string | null> {
    const collection = await this.getCollection()
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour

    const result = await collection.updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0 ? resetToken : null
  }
}

export const userService = new UserService()
