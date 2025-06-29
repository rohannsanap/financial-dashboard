"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Bell, Palette, Shield } from "lucide-react"

interface UserProfileProps {
  token: string
}

interface UserProfile {
  _id: string
  email: string
  name: string
  avatar?: string
  role: string
  isEmailVerified: boolean
  preferences: {
    currency: string
    notifications: {
      email: boolean
      push: boolean
      transactionAlerts: boolean
      weeklyReports: boolean
    }
    theme: "light" | "dark"
  }
  createdAt: string
  lastLoginAt?: string
}

export default function UserProfile({ token }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    preferences: {
      currency: "USD",
      notifications: {
        email: true,
        push: true,
        transactionAlerts: true,
        weeklyReports: true,
      },
      theme: "dark" as "light" | "dark",
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name,
          preferences: data.preferences,
        })
      } else {
        setError("Failed to load profile")
      }
    } catch (error) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setSuccess("Profile updated successfully")
      } else {
        setError("Failed to update profile")
      }
    } catch (error) {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [field]: value,
        },
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Alert className="bg-red-900/20 border-red-800">
        <AlertDescription className="text-red-400">Failed to load profile data</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-red-900/20 border-red-800">
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/20 border-green-800">
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-white">Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-slate-700 text-white text-xl">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-white font-medium">{profile.name}</h3>
              <p className="text-slate-400">{profile.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    profile.isEmailVerified ? "bg-green-900/20 text-green-400" : "bg-yellow-900/20 text-yellow-400"
                  }`}
                >
                  {profile.isEmailVerified ? "Verified" : "Unverified"}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-blue-900/20 text-blue-400">{profile.role}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-slate-700 border-slate-600 text-slate-400 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currency" className="text-white">
              Default Currency
            </Label>
            <select
              id="currency"
              value={formData.preferences.currency}
              onChange={(e) => handlePreferenceChange("currency", e.target.value)}
              className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div>
            <Label htmlFor="theme" className="text-white">
              Theme
            </Label>
            <select
              id="theme"
              value={formData.preferences.theme}
              onChange={(e) => handlePreferenceChange("theme", e.target.value)}
              className="w-full mt-1 bg-slate-700 border-slate-600 text-white rounded-md px-3 py-2"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <CardTitle className="text-white">Notification Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email Notifications</Label>
              <p className="text-sm text-slate-400">Receive notifications via email</p>
            </div>
            <Switch
              checked={formData.preferences.notifications.email}
              onCheckedChange={(checked) => handleNotificationChange("email", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Push Notifications</Label>
              <p className="text-sm text-slate-400">Receive browser push notifications</p>
            </div>
            <Switch
              checked={formData.preferences.notifications.push}
              onCheckedChange={(checked) => handleNotificationChange("push", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Transaction Alerts</Label>
              <p className="text-sm text-slate-400">Get notified of large transactions</p>
            </div>
            <Switch
              checked={formData.preferences.notifications.transactionAlerts}
              onCheckedChange={(checked) => handleNotificationChange("transactionAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Weekly Reports</Label>
              <p className="text-sm text-slate-400">Receive weekly financial summaries</p>
            </div>
            <Switch
              checked={formData.preferences.notifications.weeklyReports}
              onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <CardTitle className="text-white">Account Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Account Created</Label>
              <p className="text-sm text-slate-400">{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {profile.lastLoginAt && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Last Login</Label>
                <p className="text-sm text-slate-400">{new Date(profile.lastLoginAt).toLocaleString()}</p>
              </div>
            </div>
          )}

          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
