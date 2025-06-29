import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  avatar?: string
  role: "user" | "admin"
  isEmailVerified: boolean
  emailVerificationToken?: string
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  preferences: {
    currency: string
    notifications: {
      email: boolean
      push: boolean
      transactionAlerts: boolean
      weeklyReports: boolean
    }
    theme: "light" | "dark"
  }
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface CreateUserInput {
  email: string
  password: string
  name: string
}

export interface UpdateUserInput {
  name?: string
  avatar?: string
  preferences?: Partial<User["preferences"]>
}
