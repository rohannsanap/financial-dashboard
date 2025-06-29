import { describe, it, expect, beforeEach } from "@jest/globals"
import { POST } from "@/app/api/auth/login/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock the services
jest.mock("@/lib/services/userService", () => ({
  userService: {
    getUserByEmail: jest.fn(),
    verifyPassword: jest.fn(),
    updateLastLogin: jest.fn(),
  },
}))

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock-jwt-token"),
}))

describe("/api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should login successfully with valid credentials", async () => {
    const mockUser = {
      _id: "user-id",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      isEmailVerified: true,
      preferences: {},
    }

    const { userService } = require("@/lib/services/userService")
    userService.getUserByEmail.mockResolvedValue(mockUser)
    userService.verifyPassword.mockResolvedValue(true)
    userService.updateLastLogin.mockResolvedValue(undefined)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("Login successful")
    expect(data.token).toBe("mock-jwt-token")
    expect(data.user.email).toBe("test@example.com")
  })

  it("should reject invalid credentials", async () => {
    const { userService } = require("@/lib/services/userService")
    userService.getUserByEmail.mockResolvedValue(null)

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "password123",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe("Invalid credentials")
  })

  it("should require email and password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        // Missing password
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe("Email and password are required")
  })
})
