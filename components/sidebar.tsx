"use client"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  BarChart3,
  User,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: CreditCard, label: "Transactions", path: "/transactions" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: User, label: "Personal", path: "/personal" },
  { icon: MessageSquare, label: "Message", path: "/message" },
  { icon: Settings, label: "Setting", path: "/settings" },
  { icon: Shield, label: "Admin", path: "/admin", adminOnly: true },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    // Get user role from token
    const token = getCookie("auth-token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserRole(payload.role || "user")
      } catch (e) {
        console.error("Invalid token")
      }
    }
  }, [])

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return ""
  }

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/login")
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) {
      return userRole === "admin"
    }
    return true
  })

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="ml-3 text-xl font-bold text-white">Penta</span>
          {userRole === "admin" && (
            <span className="ml-2 px-2 py-1 bg-yellow-900/20 text-yellow-400 text-xs rounded border border-yellow-800">
              Admin
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
              {item.adminOnly && <Shield className="w-3 h-3 ml-auto text-yellow-400" />}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
}
