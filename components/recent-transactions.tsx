import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

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

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) => {
    const sign = amount >= 0 ? "+" : ""
    return `${sign}$${Math.abs(amount).toFixed(2)}`
  }

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? "text-green-400" : "text-red-400"
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Recent Transaction</CardTitle>
          <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0">
            See all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                <AvatarFallback className="bg-slate-700 text-white text-sm">
                  {transaction.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-sm">{transaction.description}</p>
                <p className="text-slate-400 text-xs">{transaction.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-medium text-sm ${getAmountColor(transaction.amount)}`}>
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
