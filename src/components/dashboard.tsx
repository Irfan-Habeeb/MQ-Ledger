'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MonthlyTrendsChart } from '@/components/charts/monthly-trends-chart'
import { SavingsRateChart } from '@/components/charts/savings-rate-chart'
import { ExpenseRatioChart } from '@/components/charts/expense-ratio-chart'
import { CategoryBreakdownChart } from '@/components/charts/category-breakdown-chart'
import { formatCurrency, formatCurrencyForDisplay, formatBalanceForDisplay, getLast12Months, calculatePeriodTotals } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase'
import { getCurrentUser, signOut, isUserAuthorized, User } from '@/lib/auth'
import { AccountingEntry, MonthlyData, CategoryData, SavingsRateData, ExpenseRatioData } from '@/types'
import { CreditCard, PiggyBank, BarChart3, Plus, RefreshCw, Trash2, User as UserIcon, LogOut, TrendingUp, TrendingDown, Target, Filter, Download } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { FilterDialog, FilterOptions } from '@/components/ui/filter-dialog'
import { exportToPDF } from '@/lib/pdf-export'

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filter state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    dateRange: 'all',
    type: 'All',
    category: ''
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successEntry, setSuccessEntry] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  // Summary calculations - memoized for performance
  const totals = useMemo(() => calculatePeriodTotals(entries), [entries])
  const currentMonthEntries = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
    })
  }, [entries])
  const currentMonthTotals = useMemo(() => calculatePeriodTotals(currentMonthEntries), [currentMonthEntries])

  // Helper function to filter entries
  const getFilteredEntries = (entries: AccountingEntry[], filters: FilterOptions): AccountingEntry[] => {
    return entries.filter(entry => {
      // Date range filter
      if (filters.dateRange !== 'all') {
        const entryDate = new Date(entry.date)
        const startDate = filters.startDate ? new Date(filters.startDate) : null
        const endDate = filters.endDate ? new Date(filters.endDate) : null
        
        if (startDate && entryDate < startDate) return false
        if (endDate && entryDate > endDate) return false
      }
      
      // Type filter
      if (filters.type && filters.type !== 'All' && entry.type !== filters.type) {
        return false
      }
      
      // Category filter
      if (filters.category && entry.category !== filters.category) {
        return false
      }
      
      return true
    })
  }

  const calculateChartData = useCallback(() => {
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
  }, [entries, categoryView])

  useEffect(() => {
    if (isAuthenticated && user) {
      loadEntries()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (entries.length > 0) {
      calculateChartData()
    }
  }, [entries, categoryView, calculateChartData])

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
      // Handle session errors gracefully
      if (error instanceof Error && error.message.includes('Auth session missing')) {
        setIsAuthenticated(false)
        setUser(null)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) throw error
      setUser(null)
      setIsAuthenticated(false)
      setEntries([])
      // Force page refresh to ensure clean state
      window.location.href = '/'
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
      setEntries((data as unknown as AccountingEntry[]) || [])
      setCurrentPage(1) // Reset to first page when loading new data
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
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
      // Validate required fields
      if (!formData.description.trim()) {
        alert('Please enter a description')
        return
      }
      
      if (!formData.category) {
        alert('Please select a category')
        return
      }

      console.log('Submitting entry:', {
        date: formData.date,
        description: formData.description.trim(),
        type: formData.type,
        category: formData.category,
        amount: amount,
        user_email: user.email
      })

      const supabaseClient = getSupabaseClient()
              const { data, error } = await supabaseClient
        .from('accounting_entries')
        .insert({
          date: formData.date,
          description: formData.description.trim(),
          type: formData.type,
          category: formData.category,
          amount: amount,
          user_email: user.email
        })
        .select()

      if (error) {
              console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
        throw error
      }

      console.log('Entry added successfully:', data)

      // Show success modal with entry details
      setSuccessEntry({
        description: formData.description.trim(),
        type: formData.type,
        category: formData.category,
        amount: formatCurrency(amount),
        date: new Date(formData.date).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })
      })
      setShowSuccessModal(true)

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
      let errorMessage = 'Unknown error'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error)
      }
      
      alert(`Error adding entry: ${errorMessage}`)
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Don't scroll to top - stay at current position
  }

  // Filter and export functions
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleExportPDF = (filters: FilterOptions) => {
    // Check if it's "All Time" filter
    if (filters.dateRange === 'all') {
      alert('PDF export is not available for "All Time" filter. Please select a specific time period.')
      return
    }
    
    const filteredEntries = getFilteredEntries(entries, filters)
    const filteredTotals = calculatePeriodTotals(filteredEntries)
    
    exportToPDF({
      entries: filteredEntries,
      filters,
      totals: filteredTotals
    })
  }

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set(entries.map(entry => entry.category))
    return Array.from(uniqueCategories).sort()
  }, [entries])

  // Filter entries based on active filters
  const filteredEntries = useMemo(() => {
    return getFilteredEntries(entries, activeFilters)
  }, [entries, activeFilters])

  // Calculate pagination for filtered entries
  const totalPages = useMemo(() => Math.ceil(filteredEntries.length / itemsPerPage), [filteredEntries.length, itemsPerPage])
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage])
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage])
  const currentEntries = useMemo(() => filteredEntries.slice(startIndex, endIndex), [filteredEntries, startIndex, endIndex])

  const toggleTrendDataset = (dataset: 'income' | 'expenses' | 'balance') => {
    setVisibleTrendDatasets(prev => 
      prev.includes(dataset) 
        ? prev.filter(d => d !== dataset)
        : [...prev, dataset]
    )
  }

  const getCategoryOptions = (type: 'Income' | 'Expense') => {
    const categories = {
      Income: [
        'Salary',
        'Freelance',
        'Investment',
        'Business',
        'Tuition Fees',
        'Online Course Sales',
        'Coaching Sessions',
        'Mentorship Programs',
        'Workshop Fees',
        'Study Material Sales',
        'Consultation Fees',
        'Corporate Training',
        'Exam Preparation',
        'Other Income'
      ],
      Expense: [
        'Food',
        'Transport',
        'Entertainment',
        'Shopping',
        'Bills',
        'Healthcare',
        'Education',
        'Teacher Salaries',
        'Platform Subscriptions',
        'Marketing & Ads',
        'Study Materials',
        'Office Rent',
        'Internet & Tech',
        'Travel & Transport',
        'Utilities & Bills',
        'Professional Development',
        'Other Expenses'
      ]
    }
    return categories[type]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#cedce7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your financial dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // This will be handled by the main page component
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#cedce7' }}>
      {/* Header */}
      <header className="backdrop-blur-md bg-white/80 shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity" style={{ fontFamily: 'var(--font-montserrat), system-ui, sans-serif' }}>
                <span style={{ color: '#344e80' }}>MENTORS</span>
                <span style={{ color: '#43a24c' }}>CUE</span>
              </Link>
              <div className="hidden lg:block h-8 w-px bg-gray-300"></div>
              <h1 className="hidden md:block text-xl font-semibold text-gray-900">Financial Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100/80 backdrop-blur-sm rounded-full">
                <UserIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium truncate max-w-32">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={loadEntries} className="hidden sm:flex">
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline font-medium">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Monthly Income</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrencyForDisplay(currentMonthTotals.income)}
              </div>
              <p className="text-xs text-white/80 mt-1">
                Total: {formatCurrencyForDisplay(totals.income)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Monthly Expenses</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatCurrencyForDisplay(currentMonthTotals.expense)}
              </div>
              <p className="text-xs text-white/80 mt-1">
                Total: {formatCurrencyForDisplay(totals.expense)}
              </p>
            </CardContent>
          </Card>

          <Card className={`shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300 ${
            currentMonthTotals.balance >= 0 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Monthly Balance</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatBalanceForDisplay(currentMonthTotals.balance)}
              </div>
              <p className="text-xs text-white/80 mt-1">
                Total: {formatBalanceForDisplay(totals.balance)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/90">Monthly Entries</CardTitle>
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {currentMonthEntries.length}
              </div>
              <p className="text-xs text-white/80 mt-1">
                Total: {entries.length} entries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Entry Form */}
        <Card className="mb-8 bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              Add New Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select value={formData.type} onValueChange={(value: 'Income' | 'Expense') => setFormData({ ...formData, type: value, category: '' })}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoryOptions(formData.type).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-11"
                  />
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-11">
                    Add
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                Monthly Trends
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={visibleTrendDatasets.includes('income') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTrendDataset('income')}
                  className={visibleTrendDatasets.includes('income') ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Income
                </Button>
                <Button
                  variant={visibleTrendDatasets.includes('expenses') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTrendDataset('expenses')}
                  className={visibleTrendDatasets.includes('expenses') ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Expenses
                </Button>
                <Button
                  variant={visibleTrendDatasets.includes('balance') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTrendDataset('balance')}
                  className={visibleTrendDatasets.includes('balance') ? 'bg-blue-600 hover:bg-blue-700' : ''}
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
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                Category Breakdown
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryView === 'Expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryView('Expense')}
                  className={categoryView === 'Expense' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Expenses
                </Button>
                <Button
                  variant={categoryView === 'Income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryView('Income')}
                  className={categoryView === 'Income' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Income
                </Button>
                <Button
                  variant={categoryView === 'All' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryView('All')}
                  className={categoryView === 'All' ? 'bg-purple-600 hover:bg-purple-700' : ''}
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
          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                  <PiggyBank className="h-5 w-5 text-emerald-600" />
                </div>
                Savings Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SavingsRateChart data={savingsRateData} />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                Expense vs Income Ratio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseRatioChart data={expenseRatioData} />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{entries.length}</div>
                <div className="text-sm text-gray-600 mt-1">Total Entries</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {totals.income > 0 ? ((totals.balance / totals.income) * 100).toFixed(1) : '0'}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Overall Savings Rate</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(entries.map(e => e.category)).size}
                </div>
                <div className="text-sm text-gray-600 mt-1">Categories Used</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries Table */}
        <Card className="bg-white shadow-lg border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                </div>
                Recent Entries
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterDialogOpen(true)}
                  className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportPDF(activeFilters)}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Description</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Created By</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentEntries.map((entry, index) => (
                    <tr key={entry.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold">{new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                          <span className="text-xs text-gray-500">{new Date(entry.date).getFullYear()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium max-w-xs">
                        <div className="truncate" title={entry.description}>
                          {entry.description}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          entry.type === 'Income' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                          {entry.category}
                        </span>
                      </td>
                      <td className={`py-4 px-6 font-bold text-lg ${
                        entry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                          {entry.user_email || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={entries.length}
              itemsPerPage={itemsPerPage}
            />
          </CardContent>
        </Card>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        onApply={handleApplyFilters}
        onExport={handleExportPDF}
        currentFilters={activeFilters}
        categories={categories}
      />

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">Entry Added Successfully!</span>
            </DialogTitle>
          </DialogHeader>
          
          {successEntry && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Entry Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Description:</span>
                    <span className="text-sm font-medium text-gray-900">{successEntry.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      successEntry.type === 'Income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {successEntry.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium text-gray-900">{successEntry.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className={`text-sm font-bold ${
                      successEntry.type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {successEntry.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium text-gray-900">{successEntry.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your entry has been saved and is now visible in the table below.</span>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowSuccessModal(false)}
              className="text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              View Entries
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}