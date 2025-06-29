"use client"

import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardHeader() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input placeholder="Search..." className="pl-10 bg-slate-700 border-slate-600 text-white w-64" />
          </div>

          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
            <Bell className="w-5 h-5" />
          </Button>

          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-slate-700 text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
