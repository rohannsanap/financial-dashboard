"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import MetricsCards from "@/components/metrics-cards"
import SimpleOverview from "@/components/simple-overview"
import RecentTransactions from "@/components/recent-transactions"
import TransactionsTable from "@/components/transactions-table"
import UserProfile from "@/components/user-profile"
import SimpleNotifications from "@/components/simple-notifications"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"

interface Transaction {
  _id: string
  name: string
  email: string
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
  category: string
  description: string
}

interface DashboardData {
  metrics: {
    balance: number
    revenue: number
    expenses: number
    savings: number
  }
  transactions: Transaction[]
  chartData: Array<{
    month: string
    income: number
    expenses: number
  }>
  categoryBreakdown: Array<{
    _id: string
    total: number
    count: number
    type: string
  }>
  analytics: {
    totalIncome: number
    totalExpenses: number
    balance: number
    transactionCount: number
    avgTransactionAmount: number
  }
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user info from token
    const token = getCookie("auth-token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUser(payload)
      } catch (e) {
        console.error("Invalid token")
      }
    }

    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${getCookie("auth-token")}`,
        },
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return ""
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <Alert className="max-w-md mx-auto mt-8 bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              {user && <SimpleNotifications userId={user.userId} token={getCookie("auth-token") || ""} />}
            </div>
          </div>
        </div>

        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-700">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700">
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MetricsCards metrics={data.metrics} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SimpleOverview data={data.chartData} />
                </div>
                <div>
                  <RecentTransactions transactions={data.transactions.slice(0, 5)} />
                </div>
              </div>

              <TransactionsTable transactions={data.transactions} />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionsTable transactions={data.transactions} />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <UserProfile token={getCookie("auth-token") || ""} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
