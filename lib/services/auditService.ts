import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface AuditLogEntry {
  userId: ObjectId
  action: string
  resource: string
  resourceId?: ObjectId
  details: any
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

export class AuditService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection("audit_logs")
  }

  async log(entry: Omit<AuditLogEntry, "timestamp">) {
    const collection = await this.getCollection()

    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    }

    await collection.insertOne(auditEntry)
  }

  async getUserAuditLogs(
    userId: ObjectId,
    options: {
      page?: number
      limit?: number
      action?: string
      resource?: string
      startDate?: Date
      endDate?: Date
    } = {},
  ) {
    const collection = await this.getCollection()
    const { page = 1, limit = 50, action, resource, startDate, endDate } = options

    const query: any = { userId }

    if (action) query.action = action
    if (resource) query.resource = resource
    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = startDate
      if (endDate) query.timestamp.$lte = endDate
    }

    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await collection.countDocuments(query)

    return { logs, total }
  }

  async getSystemAuditLogs(
    options: {
      page?: number
      limit?: number
      action?: string
      resource?: string
      startDate?: Date
      endDate?: Date
    } = {},
  ) {
    const collection = await this.getCollection()
    const { page = 1, limit = 100, action, resource, startDate, endDate } = options

    const query: any = {}

    if (action) query.action = action
    if (resource) query.resource = resource
    if (startDate || endDate) {
      query.timestamp = {}
      if (startDate) query.timestamp.$gte = startDate
      if (endDate) query.timestamp.$lte = endDate
    }

    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await collection.countDocuments(query)

    return { logs, total }
  }

  // Helper methods for common audit actions
  async logLogin(userId: ObjectId, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: "LOGIN",
      resource: "auth",
      details: { success: true },
      ipAddress,
      userAgent,
    })
  }

  async logFailedLogin(email: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId: new ObjectId(), // Use empty ObjectId for failed attempts
      action: "LOGIN_FAILED",
      resource: "auth",
      details: { email, success: false },
      ipAddress,
      userAgent,
    })
  }

  async logTransactionCreate(userId: ObjectId, transactionId: ObjectId, transaction: any) {
    await this.log({
      userId,
      action: "CREATE",
      resource: "transaction",
      resourceId: transactionId,
      details: {
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
      },
    })
  }

  async logTransactionUpdate(userId: ObjectId, transactionId: ObjectId, changes: any) {
    await this.log({
      userId,
      action: "UPDATE",
      resource: "transaction",
      resourceId: transactionId,
      details: { changes },
    })
  }

  async logTransactionDelete(userId: ObjectId, transactionId: ObjectId) {
    await this.log({
      userId,
      action: "DELETE",
      resource: "transaction",
      resourceId: transactionId,
      details: {},
    })
  }

  async logProfileUpdate(userId: ObjectId, changes: any) {
    await this.log({
      userId,
      action: "UPDATE",
      resource: "profile",
      details: { changes },
    })
  }

  async logPasswordChange(userId: ObjectId) {
    await this.log({
      userId,
      action: "PASSWORD_CHANGE",
      resource: "auth",
      details: {},
    })
  }

  async logDataExport(userId: ObjectId, exportType: string, recordCount: number) {
    await this.log({
      userId,
      action: "EXPORT",
      resource: "data",
      details: { exportType, recordCount },
    })
  }
}

export const auditService = new AuditService()
