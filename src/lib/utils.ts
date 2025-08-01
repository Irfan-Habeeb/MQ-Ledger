import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  // Use RS. instead of ₹ for better compatibility
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount))
  
  return `RS. ${formatted}`
}

export function formatCurrencyForDisplay(amount: number): string {
  // Use RS. instead of ₹ for better compatibility
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
  
  return `RS. ${formatted}`
}

export function getLast12Months() {
  const months = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    })
  }
  
  return months
}

export function calculatePeriodTotals(entries: { type: string; amount: number }[]) {
  const totals = { income: 0, expense: 0, balance: 0 }
  
  entries.forEach(entry => {
    if (entry.type === 'Income') {
      totals.income += Math.abs(entry.amount)
    } else {
      totals.expense += Math.abs(entry.amount)
    }
  })
  
  totals.balance = totals.income - totals.expense
  return totals
}

export function getCategoryColor(index: number) {
  const colors = [
    '#dc3545', '#fd7e14', '#ffc107', '#28a745',
    '#20c997', '#17a2b8', '#6f42c1', '#e83e8c',
    '#6c757d', '#495057', '#343a40', '#212529'
  ]
  return colors[index % colors.length]
}