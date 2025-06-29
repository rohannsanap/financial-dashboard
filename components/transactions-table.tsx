"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Download } from "lucide-react"
import ExportModal from "./export-modal"

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

interface TransactionsTableProps {
  transactions: Transaction[]
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<keyof Transaction>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showExportModal, setShowExportModal] = useState(false)

  const filteredAndSortedTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const formatCurrency = (amount: number) => {
    const sign = amount >= 0 ? "+" : "-"
    return `${sign}$${Math.abs(amount).toFixed(2)}`
  }

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? "text-green-400" : "text-red-400"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900/20 text-green-400 border-green-800"
      case "pending":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-800"
      case "failed":
        return "bg-red-900/20 text-red-400 border-red-800"
      default:
        return "bg-slate-700 text-slate-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <>
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Transactions</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search for anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white w-64"
                />
              </div>
              <div className="flex items-center space-x-2 bg-slate-700 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 text-sm">10 May - 20 May</span>
              </div>
              <Button
                onClick={() => setShowExportModal(true)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white text-sm rounded px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th
                    className="text-left py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("name")}
                  >
                    Name
                  </th>
                  <th
                    className="text-left py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("date")}
                  >
                    Date
                  </th>
                  <th
                    className="text-left py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                  </th>
                  <th
                    className="text-left py-3 px-4 text-slate-400 font-medium cursor-pointer hover:text-white"
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-4 px-4">
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
                          <p className="text-white font-medium">{transaction.name}</p>
                          <p className="text-slate-400 text-sm">{transaction.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{formatDate(transaction.date)}</td>
                    <td className={`py-4 px-4 font-medium ${getAmountColor(transaction.amount)}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        transactions={filteredAndSortedTransactions}
      />
    </>
  )
}
