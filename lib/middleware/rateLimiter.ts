import { type NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests

    // Clean up expired entries every 5 minutes
    setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  private getKey(request: NextRequest): string {
    // Use IP address or user ID for rate limiting
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
    return ip
  }

  check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(request)
    const now = Date.now()

    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      }
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: this.store[key].resetTime,
      }
    }

    this.store[key].count++

    return {
      allowed: this.store[key].count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - this.store[key].count),
      resetTime: this.store[key].resetTime,
    }
  }
}

// Different rate limiters for different endpoints
export const authLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes
export const apiLimiter = new RateLimiter(15 * 60 * 1000, 100) // 100 requests per 15 minutes
export const strictLimiter = new RateLimiter(60 * 1000, 10) // 10 requests per minute

export function withRateLimit(limiter: RateLimiter) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    return async (request: NextRequest) => {
      const { allowed, remaining, resetTime } = limiter.check(request)

      if (!allowed) {
        return NextResponse.json(
          {
            error: "Too many requests",
            message: "Rate limit exceeded. Please try again later.",
            resetTime: new Date(resetTime).toISOString(),
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limiter.maxRequests.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": resetTime.toString(),
              "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
            },
          },
        )
      }

      const response = await handler(request)

      // Add rate limit headers to successful responses
      response.headers.set("X-RateLimit-Limit", limiter.maxRequests.toString())
      response.headers.set("X-RateLimit-Remaining", remaining.toString())
      response.headers.set("X-RateLimit-Reset", resetTime.toString())

      return response
    }
  }
}
