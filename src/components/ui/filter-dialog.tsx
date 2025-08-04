'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Filter, X } from 'lucide-react'

export interface FilterOptions {
  dateRange: 'all' | 'current-month' | 'previous-month' | 'last-30' | 'last-60' | 'last-90' | 'custom'
  startDate?: string
  endDate?: string
  type?: 'Income' | 'Expense' | 'All'
  category?: string
}

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  onExport: (filters: FilterOptions) => void
  currentFilters: FilterOptions
  categories: string[]
}

export function FilterDialog({ isOpen, onClose, onApply, onExport, currentFilters, categories }: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterOptions>(() => ({
    type: 'All',
    category: 'all',
    ...currentFilters
  }))

  // Update filters when currentFilters prop changes
  useEffect(() => {
    setFilters({
      type: 'All',
      category: 'all',
      ...currentFilters
    })
  }, [currentFilters])

  const handleDateRangeChange = (range: string) => {
    const today = new Date()
    let startDate = ''
    let endDate = today.toISOString().split('T')[0]

    switch (range) {
      case 'current-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        break
      case 'previous-month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0]
        endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
        break
      case 'last-30':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last-60':
        startDate = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last-90':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'custom':
        // Keep existing custom dates
        startDate = filters.startDate || ''
        endDate = filters.endDate || today.toISOString().split('T')[0]
        break
      default:
        startDate = ''
        endDate = today.toISOString().split('T')[0]
    }

    setFilters(prev => ({
      ...prev,
      dateRange: range as FilterOptions['dateRange'],
      startDate,
      endDate
    }))
  }

  const handleApply = () => {
    try {
      onApply(filters)
      onClose()
    } catch (error) {
      console.error('Error applying filters:', error)
    }
  }

  const handleExport = () => {
    try {
      onExport(filters)
      onClose()
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  const handleReset = () => {
    try {
      setFilters({
        dateRange: 'all',
        type: 'All',
        category: 'all'
      })
    } catch (error) {
      console.error('Error resetting filters:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Filter className="h-5 w-5 mr-2" />
            Filter & Export
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
            <Select value={filters.dateRange || 'all'} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Time</SelectItem>
                <SelectItem value="current-month" className="text-gray-900 dark:text-white">Current Month</SelectItem>
                <SelectItem value="previous-month" className="text-gray-900 dark:text-white">Previous Month</SelectItem>
                <SelectItem value="last-30" className="text-gray-900 dark:text-white">Last 30 Days</SelectItem>
                <SelectItem value="last-60" className="text-gray-900 dark:text-white">Last 60 Days</SelectItem>
                <SelectItem value="last-90" className="text-gray-900 dark:text-white">Last 90 Days</SelectItem>
                <SelectItem value="custom" className="text-gray-900 dark:text-white">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Type Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <Select value={filters.type || 'All'} onValueChange={(value: string) => setFilters(prev => ({ ...prev, type: value as 'Income' | 'Expense' | 'All' }))}>
              <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="All" className="text-gray-900 dark:text-white">All Types</SelectItem>
                <SelectItem value="Income" className="text-gray-900 dark:text-white">Income Only</SelectItem>
                <SelectItem value="Expense" className="text-gray-900 dark:text-white">Expense Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <Select value={filters.category || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
              <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Categories</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category} value={category} className="text-gray-900 dark:text-white">{category}</SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Reset
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} className="w-full bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export to PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}