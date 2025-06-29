import { getDatabase } from "@/lib/mongodb"
import { socketManager } from "@/lib/websocket/socketManager"
import type { ObjectId } from "mongodb"

interface NotificationData {
  userId: ObjectId
  type: "transaction" | "balance" | "system" | "security"
  title: string
  message: string
  data?: any
  priority: "low" | "medium" | "high"
}

export class NotificationService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection("notifications")
  }

  async createNotification(notificationData: NotificationData) {
    const collection = await this.getCollection()

    const notification = {
      ...notificationData,
      read: false,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(notification)

    // Send real-time notification (simplified)
    socketManager.emitNotification(notificationData.userId.toString(), {
      id: result.insertedId,
      ...notification,
    })

    return { ...notification, _id: result.insertedId }
  }

  async getUserNotifications(userId: ObjectId, options: { page?: number; limit?: number; unreadOnly?: boolean } = {}) {
    const collection = await this.getCollection()
    const { page = 1, limit = 20, unreadOnly = false } = options

    const query: any = { userId }
    if (unreadOnly) {
      query.read = false
    }

    const notifications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await collection.countDocuments(query)

    return { notifications, total }
  }

  async markAsRead(notificationId: ObjectId) {
    const collection = await this.getCollection()
    const result = await collection.updateOne({ _id: notificationId }, { $set: { read: true } })
    return result.modifiedCount > 0
  }

  async markAllAsRead(userId: ObjectId) {
    const collection = await this.getCollection()
    const result = await collection.updateMany({ userId, read: false }, { $set: { read: true } })
    return result.modifiedCount
  }
}

export const notificationService = new NotificationService()
