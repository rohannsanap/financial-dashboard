import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function TransactionsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Transactions Page</h1>
        <p className="text-slate-400">This page is under construction</p>
      </div>
    </div>
  )
}
