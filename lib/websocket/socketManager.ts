// Simplified socket manager without Socket.IO dependency
export class SimpleSocketManager {
  private userSockets: Map<string, string> = new Map()

  initialize(server?: any) {
    console.log("Simple socket manager initialized (no WebSocket)")
  }

  // Emit transaction update to specific user (simplified - just log)
  emitTransactionUpdate(userId: string, transaction: any) {
    console.log(`[Socket] Transaction update for user ${userId}:`, transaction.amount)
  }

  // Emit balance update to specific user (simplified - just log)
  emitBalanceUpdate(userId: string, balance: any) {
    console.log(`[Socket] Balance update for user ${userId}:`, balance)
  }

  // Emit notification to specific user (simplified - just log)
  emitNotification(userId: string, notification: any) {
    console.log(`[Socket] Notification for user ${userId}:`, notification.title)
  }

  // Broadcast system-wide notifications (simplified - just log)
  broadcastSystemNotification(notification: any) {
    console.log(`[Socket] System notification:`, notification.title)
  }

  // Get connected users count (always return 0 for simplified version)
  getConnectedUsersCount(): number {
    return 0
  }

  // Check if user is online (always return false for simplified version)
  isUserOnline(userId: string): boolean {
    return false
  }
}

export const socketManager = new SimpleSocketManager()
