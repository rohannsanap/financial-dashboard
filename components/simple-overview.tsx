"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SimpleOverviewProps {
  data: Array<{
    month: string
    income: number
    expenses: number
  }>
}

export default function SimpleOverview({ data }: SimpleOverviewProps) {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = data.reduce((sum, item) => sum + Math.abs(item.expenses), 0)
  const netBalance = totalIncome - totalExpenses

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-green-400 text-2xl font-bold">${totalIncome.toLocaleString()}</div>
            <div className="text-slate-400 text-sm">Total Income</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-red-400 text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <div className="text-slate-400 text-sm">Total Expenses</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${netBalance.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">Net Balance</div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="space-y-2">
          <h3 className="text-white font-medium">Monthly Breakdown</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-700 rounded p-3">
                <span className="text-white font-medium">{item.month}</span>
                <div className="flex space-x-4 text-sm">
                  <span className="text-green-400">+${item.income.toLocaleString()}</span>
                  <span className="text-red-400">-${Math.abs(item.expenses).toLocaleString()}</span>
                  <span
                    className={`font-medium ${(item.income + item.expenses) >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    ${(item.income + item.expenses).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
