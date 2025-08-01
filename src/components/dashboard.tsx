'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MonthlyTrendsChart } from '@/components/charts/monthly-trends-chart'
import { SavingsRateChart } from '@/components/charts/savings-rate-chart'
import { ExpenseRatioChart } from '@/components/charts/expense-ratio-chart'
import { CategoryBreakdownChart } from '@/components/charts/category-breakdown-chart'
import { formatCurrency, formatCurrencyForDisplay, getLast12Months, calculatePeriodTotals } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase'
import { getCurrentUser, signOut, isUserAuthorized, User } from '@/lib/auth'
import { AccountingEntry, MonthlyData, CategoryData, SavingsRateData, ExpenseRatioData } from '@/types'
import { DollarSign, CreditCard, PiggyBank, BarChart3, Plus, RefreshCw, Trash2, User as UserIcon, LogOut } from 'lucide-react'

export function Dashboard() {
  const [entries, setEntries] = useState<AccountingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'Expense' as 'Income' | 'Expense',
    category: '',
    amount: ''
  })

  // Chart states
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({ labels: [], income: [], expenses: [], balance: [] })
  const [categoryData, setCategoryData] = useState<CategoryData>({ labels: [], data: [] })
  const [savingsRateData, setSavingsRateData] = useState<SavingsRateData>({ labels: [], data: [] })
  const [expenseRatioData, setExpenseRatioData] = useState<ExpenseRatioData>({ labels: [], data: [] })
  
  // Chart visibility states
  const [visibleTrendDatasets, setVisibleTrendDatasets] = useState<('income' | 'expenses' | 'balance')[]>(['income', 'expenses', 'balance'])
  const [categoryView, setCategoryView] = useState<'Income' | 'Expense' | 'All'>('Expense')

  // Summary calculations
  const totals = calculatePeriodTotals(entries)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
  })
  const currentMonthTotals = calculatePeriodTotals(currentMonthEntries)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      loadEntries()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (entries.length > 0) {
      calculateChartData()
    }
  }, [entries, categoryView])

  const checkUser = async () => {
    try {
      const user = await getCurrentUser()
      if (user && isUserAuthorized(user.email)) {
        setUser(user)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) throw error
      setUser(null)
      setIsAuthenticated(false)
      setEntries([])
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const loadEntries = async () => {
    try {
      setLoading(true)
      const supabaseClient = getSupabaseClient()
      const { data, error } = await supabaseClient
        .from('accounting_entries')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateChartData = () => {
    const months = getLast12Months()
    const monthlyData: MonthlyData = { labels: [], income: [], expenses: [], balance: [] }
    const savingsRateData: SavingsRateData = { labels: [], data: [] }
    const expenseRatioData: ExpenseRatioData = { labels: [], data: [] }

    months.forEach(month => {
      const monthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.getFullYear() === month.year && entryDate.getMonth() === month.month
      })

      const totals = calculatePeriodTotals(monthEntries)
      
      monthlyData.labels.push(month.label)
      monthlyData.income.push(totals.income)
      monthlyData.expenses.push(totals.expense)
      monthlyData.balance.push(totals.balance)

      // Calculate savings rate
      if (totals.income > 0) {
        const savings = totals.income - totals.expense
        const rate = (savings / totals.income) * 100
        savingsRateData.labels.push(month.label)
        savingsRateData.data.push(Math.max(0, rate))
      } else {
        savingsRateData.labels.push(month.label)
        savingsRateData.data.push(0)
      }

      // Calculate expense ratio
      if (totals.income > 0) {
        const ratio = (totals.expense / totals.income) * 100
        expenseRatioData.labels.push(month.label)
        expenseRatioData.data.push(Math.min(100, ratio))
      } else {
        expenseRatioData.labels.push(month.label)
        expenseRatioData.data.push(0)
      }
    })

    setMonthlyData(monthlyData)
    setSavingsRateData(savingsRateData)
    setExpenseRatioData(expenseRatioData)

    // Calculate category data
    const categoryMap = new Map<string, number>()
    entries.forEach(entry => {
      if (categoryView === 'All' || entry.type === categoryView) {
        const current = categoryMap.get(entry.category) || 0
        categoryMap.set(entry.category, current + Math.abs(entry.amount))
      }
    })

    const sortedCategories = Array.from(categoryMap.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 categories

    setCategoryData({
      labels: sortedCategories.map(([category]) => category),
      data: sortedCategories.map(([, amount]) => amount)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to add entries')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const supabaseClient = getSupabaseClient()
      const { error } = await supabaseClient
        .from('accounting_entries')
        .insert({
          date: formData.date,
          description: formData.description,
          type: formData.type,
          category: formData.category,
          amount: amount,
          created_by: user.email
        })

      if (error) throw error

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'Expense',
        category: '',
        amount: ''
      })

      // Reload entries
      loadEntries()
    } catch (error) {
      console.error('Error adding entry:', error)
      alert('Error adding entry')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const supabaseClient = getSupabaseClient()
      const { error } = await supabaseClient
        .from('accounting_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Error deleting entry')
    }
  }

  const toggleTrendDataset = (dataset: 'income' | 'expenses' | 'balance') => {
    setVisibleTrendDatasets(prev => 
      prev.includes(dataset) 
        ? prev.filter(d => d !== dataset)
        : [...prev, dataset]
    )
  }

  const getCategoryOptions = (type: 'Income' | 'Expense') => {
    const categories = {
      Income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other'],
      Expense: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other']
    }
    return categories[type]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // This will be handled by the main page component
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-blue-600">Mentorscue</div>
                <div className="text-2xl font-bold text-gray-800">Cue</div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Accounting Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={loadEntries}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrencyForDisplay(totals.income)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month: {formatCurrencyForDisplay(currentMonthTotals.income)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrencyForDisplay(totals.expense)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month: {formatCurrencyForDisplay(currentMonthTotals.expense)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrencyForDisplay(totals.balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month: {formatCurrencyForDisplay(currentMonthTotals.balance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : '0'}%
              </div>
              <p className="text-xs text-muted-foreground">
                {totals.income > 0 ? `${((totals.balance / totals.income) * 100).toFixed(1)}% of income saved` : 'No income data'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Entry Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <Select value={formData.type} onValueChange={(value: 'Income' | 'Expense') => setFormData({ ...formData, type: value, category: '' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {getCategoryOptions(formData.type).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <Button type="submit">Add</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={visibleTrendDatasets.includes('income') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTrendDataset('income')}
                >
                  Income
                </Button>
                <Button
                  variant={visibleTrendDatasets.includes('expenses') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTrendDataset('expenses')}
                >
                  Expenses
                </Button>
                <Button
                  variant={visibleTrendDatasets.includes('balance') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTrendDataset('balance')}
                >
                  Balance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <MonthlyTrendsChart data={monthlyData} visibleDatasets={visibleTrendDatasets} />
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={categoryView === 'Expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryView('Expense')}
                >
                  Expenses
                </Button>
                <Button
                  variant={categoryView === 'Income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryView('Income')}
                >
                  Income
                </Button>
                <Button
                  variant={categoryView === 'All' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryView('All')}
                >
                  All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownChart data={categoryData} />
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Savings Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsRateChart data={savingsRateData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense vs Income Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseRatioChart data={expenseRatioData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-gray-600">Overall Savings Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(entries.map(e => e.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories Used</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-2">{entry.description}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.type === 'Income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-2">{entry.category}</td>
                      <td className={`py-2 font-medium ${
                        entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}