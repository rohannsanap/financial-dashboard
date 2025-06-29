import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function AnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <div className="flex-1 p-6">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics Page</h1>
          <p className="text-slate-400">Advanced analytics features coming soon</p>
        </div>
      </div>
    </div>
  )
}
