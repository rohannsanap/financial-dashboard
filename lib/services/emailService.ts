// Simplified email service for development/testing
export class EmailService {
  async sendVerificationEmail(email: string, token: string, name: string) {
    console.log(`📧 [DEV] Verification email for ${name} (${email})`)
    console.log(`🔗 Verification URL: ${process.env.NEXTAUTH_URL}/verify-email?token=${token}`)
    return Promise.resolve()
  }

  async sendPasswordResetEmail(email: string, token: string, name: string) {
    console.log(`📧 [DEV] Password reset email for ${name} (${email})`)
    console.log(`🔗 Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`)
    return Promise.resolve()
  }

  async sendTransactionAlert(email: string, transaction: any, name: string) {
    console.log(`📧 [DEV] Transaction alert for ${name} (${email})`)
    console.log(`💰 Amount: $${transaction.amount}`)
    return Promise.resolve()
  }

  async sendWeeklyReport(email: string, reportData: any, name: string) {
    console.log(`📧 [DEV] Weekly report for ${name} (${email})`)
    console.log(`📊 Income: $${reportData.totalIncome}, Expenses: $${reportData.totalExpenses}`)
    return Promise.resolve()
  }
}

export const emailService = new EmailService()
