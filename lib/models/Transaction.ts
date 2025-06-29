import type { ObjectId } from "mongodb"

export interface Transaction {
  _id?: ObjectId
  userId: ObjectId
  name: string
  email: string
  amount: number
  date: Date
  status: "completed" | "pending" | "failed"
  category: string
  description: string
  type: "income" | "expense"
  tags: string[]
  location?: string
  merchant?: string
  paymentMethod: "card" | "bank_transfer" | "cash" | "crypto"
  currency: string
  exchangeRate?: number
  originalAmount?: number
  originalCurrency?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateTransactionInput {
  userId: ObjectId
  name: string
  email: string
  amount: number
  date: Date
  status: "completed" | "pending" | "failed"
  category: string
  description: string
  type: "income" | "expense"
  tags?: string[]
  location?: string
  merchant?: string
  paymentMethod: "card" | "bank_transfer" | "cash" | "crypto"
  currency?: string
}
