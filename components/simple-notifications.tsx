"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, X } from "lucide-react"

interface SimpleNotificationsProps {
  userId: string
  token: string
}

export default function SimpleNotifications({ userId, token }: SimpleNotificationsProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState([
    {
      id: "1",
      title: "Welcome!",
      message: "Welcome to your financial dashboard",
      timestamp: new Date(),
      read: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-800">
        Ready
      </div>

      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative text-slate-300 hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-white font-medium">Notifications</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(false)}
              className="text-slate-400 hover:text-white w-6 h-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 ${
                    !notification.read ? "bg-slate-700/30" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full border border-blue-500 bg-blue-900/20">
                      <Bell className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{notification.title}</p>
                      <p className="text-slate-400 text-sm mt-1">{notification.message}</p>
                      <p className="text-slate-500 text-xs mt-2">{notification.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
