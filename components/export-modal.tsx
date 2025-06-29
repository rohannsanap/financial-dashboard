"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, X } from "lucide-react"

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

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
}

const exportFields = [
  { key: "name", label: "Name", checked: true },
  { key: "email", label: "Email", checked: true },
  { key: "amount", label: "Amount", checked: true },
  { key: "date", label: "Date", checked: true },
  { key: "status", label: "Status", checked: true },
  { key: "category", label: "Category", checked: false },
  { key: "description", label: "Description", checked: false },
]

export default function ExportModal({ isOpen, onClose, transactions }: ExportModalProps) {
  const [selectedFields, setSelectedFields] = useState(
    exportFields.reduce(
      (acc, field) => ({
        ...acc,
        [field.key]: field.checked,
      }),
      {} as Record<string, boolean>,
    ),
  )
  const [exporting, setExporting] = useState(false)

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }))
  }

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedFields).every(Boolean)
    const newState = exportFields.reduce(
      (acc, field) => ({
        ...acc,
        [field.key]: !allSelected,
      }),
      {} as Record<string, boolean>,
    )
    setSelectedFields(newState)
  }

  const generateCSV = () => {
    const selectedFieldKeys = Object.keys(selectedFields).filter((key) => selectedFields[key])

    // Create headers
    const headers = selectedFieldKeys.map((key) => exportFields.find((field) => field.key === key)?.label || key)

    // Create rows
    const rows = transactions.map((transaction) =>
      selectedFieldKeys.map((key) => {
        const value = transaction[key as keyof Transaction]
        if (key === "amount") {
          return typeof value === "number" ? value.toFixed(2) : value
        }
        if (key === "date") {
          return new Date(value as string).toLocaleDateString()
        }
        return value
      }),
    )

    // Combine headers and rows
    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return csvContent
  }

  const handleExport = async () => {
    setExporting(true)

    try {
      const csvContent = generateCSV()
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `transactions_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      onClose()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  const selectedCount = Object.values(selectedFields).filter(Boolean).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Export Transactions</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Select columns to export ({selectedCount} selected)</p>
            <Button variant="link" onClick={handleSelectAll} className="text-blue-400 hover:text-blue-300 p-0 h-auto">
              {Object.values(selectedFields).every(Boolean) ? "Deselect All" : "Select All"}
            </Button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {exportFields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={selectedFields[field.key]}
                  onCheckedChange={() => handleFieldToggle(field.key)}
                  className="border-slate-600"
                />
                <Label htmlFor={field.key} className="text-sm text-slate-300 cursor-pointer">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">{transactions.length} transactions ready for export</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedCount === 0 || exporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {exporting ? (
                  "Exporting..."
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
