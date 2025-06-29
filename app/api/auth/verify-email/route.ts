import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/userService"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 })
    }

    const success = await userService.verifyEmail(token)

    if (success) {
      return NextResponse.json({
        message: "Email verified successfully",
      })
    } else {
      return NextResponse.json({ message: "Invalid or expired verification token" }, { status: 400 })
    }
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
