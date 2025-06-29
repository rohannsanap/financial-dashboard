// Simplified weekly reports without cron dependency
import { getDatabase } from "@/lib/mongodb"
import { transactionService } from "@/lib/services/transactionService"

// Lazy load email service to avoid build-time issues
const getEmailService = async () => {
  try {
    const { emailService } = await import("@/lib/services/emailService")
    return emailService
  } catch (error) {
    console.warn("Email service not available:", error)
    return null
  }
}

export async function generateWeeklyReports() {
  console.log("Starting weekly report generation...")

  try {
    const db = await getDatabase()
    const usersCollection = db.collection("users")

    // Get all users who have weekly reports enabled
    const users = await usersCollection
      .find({
        "preferences.notifications.weeklyReports": true,
        isEmailVerified: true,
      })
      .toArray()

    for (const user of users) {
      try {
        // Get user's weekly analytics
        const analytics = await transactionService.getAnalytics(user._id, "week")

        // Send weekly report email
        const emailService = await getEmailService()
        if (emailService) {
          await emailService.sendWeeklyReport(user.email, analytics, user.name)
        }

        console.log(`Weekly report sent to ${user.email}`)
      } catch (error) {
        console.error(`Failed to send weekly report to ${user.email}:`, error)
      }
    }

    console.log("Weekly report generation completed")
  } catch (error) {
    console.error("Error in weekly report generation:", error)
  }
}

// Manual trigger function (can be called via API endpoint)
export function initializeWeeklyReports() {
  console.log("Weekly reports can be triggered manually via generateWeeklyReports()")
}
