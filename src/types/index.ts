export interface AccountingEntry {
  id: string
  date: string
  description: string
  type: 'Income' | 'Expense'
  category: string
  amount: number
  created_by: string
  created_at: string
}

export interface MonthlyData {
  labels: string[]
  income: number[]
  expenses: number[]
  balance: number[]
}

export interface CategoryData {
  labels: string[]
  data: number[]
}

export interface SavingsRateData {
  labels: string[]
  data: number[]
}

export interface ExpenseRatioData {
  labels: string[]
  data: number[]
}

export interface CategoryTrendData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
    fill: boolean
  }[]
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface ChartView {
  type: 'Income' | 'Expense' | 'All'
}

export interface DateFilter {
  type: 'all' | 'current-month' | 'last-month' | 'last-3-months' | 'current-year' | 'custom'
  startDate?: string
  endDate?: string
}