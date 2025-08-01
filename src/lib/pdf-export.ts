import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { AccountingEntry } from '@/types'
import { formatCurrency, formatCurrencyForDisplay } from './utils'

interface PDFExportOptions {
  entries: AccountingEntry[]
  filters: {
    dateRange: string
    startDate?: string
    endDate?: string
    type?: string
    category?: string
  }
  totals: {
    income: number
    expense: number
    balance: number
  }
}

export const exportToPDF = ({ entries, filters, totals }: PDFExportOptions) => {
  const doc = new jsPDF()
  
  // Add logo and title
  doc.setFontSize(24)
  doc.setTextColor(52, 78, 128) // #344e80
  doc.text('MENTORS', 20, 30)
  doc.setTextColor(67, 162, 76) // #43a24c
  doc.text('CUE', 70, 30)
  
  // Add subtitle
  doc.setFontSize(16)
  doc.setTextColor(75, 85, 99)
  doc.text('Financial Report', 20, 45)
  
  // Add filter information
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  const filterText = getFilterDescription(filters)
  doc.text(filterText, 20, 55)
  
  // Add summary
  doc.setFontSize(12)
  doc.setTextColor(31, 41, 55)
  doc.text('Summary', 20, 75)
  
  doc.setFontSize(10)
  doc.setTextColor(34, 197, 94) // Green for income
  doc.text(`Total Income: ${formatCurrencyForDisplay(totals.income)}`, 20, 85)
  
  doc.setTextColor(239, 68, 68) // Red for expense
  doc.text(`Total Expenses: ${formatCurrencyForDisplay(totals.expense)}`, 20, 95)
  
  doc.setTextColor(59, 130, 246) // Blue for balance
  doc.text(`Net Balance: ${formatCurrencyForDisplay(totals.balance)}`, 20, 105)
  
  // Add entries table
  if (entries.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(31, 41, 55)
    doc.text('Entries', 20, 125)
    
    const tableData = entries.map(entry => [
      new Date(entry.date).toLocaleDateString(),
      entry.description,
      entry.type,
      entry.category,
      formatCurrency(entry.amount)
    ])
    
    const tableHeaders = ['Date', 'Description', 'Type', 'Category', 'Amount']
    
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 130,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [52, 78, 128],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 60 }, // Description
        2: { cellWidth: 25 }, // Type
        3: { cellWidth: 30 }, // Category
        4: { cellWidth: 25 }  // Amount
      }
    })
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 120, doc.internal.pageSize.height - 10)
  }
  
  // Save the PDF
  const fileName = `mentorscue-financial-report-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

const getFilterDescription = (filters: { dateRange: string; startDate?: string; endDate?: string; type?: string; category?: string }): string => {
  const parts = []
  
  if (filters.dateRange !== 'all') {
    switch (filters.dateRange) {
      case 'current-month':
        parts.push('Current Month')
        break
      case 'previous-month':
        parts.push('Previous Month')
        break
      case 'last-30':
        parts.push('Last 30 Days')
        break
      case 'last-60':
        parts.push('Last 60 Days')
        break
      case 'last-90':
        parts.push('Last 90 Days')
        break
      case 'custom':
        if (filters.startDate && filters.endDate) {
          parts.push(`Custom Range: ${filters.startDate} to ${filters.endDate}`)
        }
        break
    }
  }
  
  if (filters.type && filters.type !== 'All') {
    parts.push(`${filters.type} Only`)
  }
  
  if (filters.category) {
    parts.push(`Category: ${filters.category}`)
  }
  
  return parts.length > 0 ? `Filter: ${parts.join(', ')}` : 'All Entries'
}