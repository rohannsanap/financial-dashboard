import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"
import Sidebar from "@/components/sidebar"
import SimpleAdminDashboard from "@/components/simple-admin-dashboard"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    redirect("/login")
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") {
      redirect("/dashboard")
    }
  } catch (error) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <SimpleAdminDashboard token={token.value} />
      </div>
    </div>
  )
}
