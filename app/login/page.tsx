"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        document.cookie = `auth-token=${data.token}; path=/; max-age=86400`
        router.push("/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("password123")
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="ml-2 text-xl font-bold text-white">Penta</span>
          </div>
          <CardTitle className="text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400">Sign in to your financial dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <Alert className="bg-red-900/20 border-red-800">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-slate-400 border-t border-slate-700 pt-4">
              Demo Accounts (Password: password123)
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                onClick={() => handleDemoLogin("demo@example.com")}
              >
                📊 Demo User
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                onClick={() => handleDemoLogin("john.doe@example.com")}
              >
                👤 John Doe
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                onClick={() => handleDemoLogin("admin@example.com")}
              >
                🔐 Admin (create with npm run create-admin)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
