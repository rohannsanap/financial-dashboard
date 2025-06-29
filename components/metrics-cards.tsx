import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, DollarSign, CreditCard, PiggyBank } from "lucide-react"

interface MetricsCardsProps {
  metrics: {
    balance: number
    revenue: number
    expenses: number
    savings: number
  }
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Balance",
      value: metrics.balance,
      icon: DollarSign,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Revenue",
      value: metrics.revenue,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Expenses",
      value: metrics.expenses,
      icon: CreditCard,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Savings",
      value: metrics.savings,
      icon: PiggyBank,
      color: "from-purple-500 to-purple-600",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{formatCurrency(card.value)}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
