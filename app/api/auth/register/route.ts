import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/userService"
import { withRateLimit, authLimiter } from "@/lib/middleware/rateLimiter"

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

async function registerHandler(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Email, password, and name are required" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Create user
    const user = await userService.createUser({ email, password, name })

    // Try to send verification email (don't fail registration if email fails)
    try {
      const emailService = await getEmailService()
      if (emailService && user.emailVerificationToken) {
        await emailService.sendVerificationEmail(email, user.emailVerificationToken, name)
      }
    } catch (emailError) {
      console.warn("Failed to send verification email:", emailError)
      // Continue with registration even if email fails
    }

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    if (error.message === "User already exists with this email") {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 409 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export const POST = withRateLimit(authLimiter)(registerHandler)
