"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OverviewChartProps {
  data: Array<{
    month: string
    income: number
    expenses: number
  }>
}

export default function OverviewChart({ data }: OverviewChartProps) {
  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expenses)))

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Overview</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-400">Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-slate-400">Expenses</span>
            </div>
            <select className="bg-slate-700 border-slate-600 text-white text-sm rounded px-2 py-1">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-end justify-between space-x-2 p-4">
          {data.map((item, index) => {
            const incomeHeight = (item.income / maxValue) * 100
            const expenseHeight = (Math.abs(item.expenses) / maxValue) * 100

            return (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div className="flex items-end space-x-1 h-48 w-full">
                  <div
                    className="bg-green-500 rounded-t w-1/2 min-h-[4px] transition-all duration-300 hover:opacity-80"
                    style={{ height: `${incomeHeight}%` }}
                    title={`Income: $${item.income}`}
                  />
                  <div
                    className="bg-red-500 rounded-t w-1/2 min-h-[4px] transition-all duration-300 hover:opacity-80"
                    style={{ height: `${expenseHeight}%` }}
                    title={`Expenses: $${Math.abs(item.expenses)}`}
                  />
                </div>
                <span className="text-xs text-slate-400 text-center">{item.month}</span>
              </div>
            )
          })}
        </div>

        {/* Legend with values */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              ${data.reduce((sum, item) => sum + item.income, 0).toLocaleString()}
            </div>
            <div className="text-slate-400">Total Income</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-semibold">
              ${data.reduce((sum, item) => sum + Math.abs(item.expenses), 0).toLocaleString()}
            </div>
            <div className="text-slate-400">Total Expenses</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
