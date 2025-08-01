import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { AccountingEntry } from '@/types'
import { formatCurrency, formatCurrencyForDisplay } from './utils'

// Extend jsPDF with autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][]
      body?: string[][]
      startY?: number
      styles?: {
        fontSize?: number
        cellPadding?: number
      }
      headStyles?: {
        fillColor?: number[]
        textColor?: number
      }
      alternateRowStyles?: {
        fillColor?: number[]
      }
      columnStyles?: {
        [key: number]: {
          cellWidth?: number
        }
      }
    }) => jsPDF
  }
}

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
  
  // Add professional header with gradient effect
  doc.setFillColor(52, 78, 128) // #344e80
  doc.rect(0, 0, 210, 40, 'F')
  
  // Add logo and title
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('MENTORS', 20, 25)
  doc.setTextColor(67, 162, 76) // #43a24c
  doc.text('CUE', 85, 25)
  
  // Add subtitle
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text('Financial Report', 20, 35)
  
  // Add filter information with better styling
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  const filterText = getFilterDescription(filters)
  doc.text(filterText, 20, 55)
  
  // Add professional summary section
  doc.setFillColor(248, 250, 252)
  doc.rect(20, 65, 170, 35, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(20, 65, 170, 35, 'D')
  
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55)
  doc.text('Financial Summary', 25, 75)
  
  doc.setFontSize(10)
  doc.setTextColor(34, 197, 94) // Green for income
  doc.text(`Total Income: ${formatCurrencyForDisplay(totals.income)}`, 25, 85)
  
  doc.setTextColor(239, 68, 68) // Red for expense
  doc.text(`Total Expenses: ${formatCurrencyForDisplay(totals.expense)}`, 25, 95)
  
  doc.setTextColor(59, 130, 246) // Blue for balance
  doc.text(`Net Balance: ${formatCurrencyForDisplay(totals.balance)}`, 25, 105)
  
  // Add entries table with professional styling
  if (entries.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(31, 41, 55)
    doc.text('Transaction Details', 20, 125)
    
    const tableData = entries.map(entry => [
      new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
      entry.description.length > 30 ? entry.description.substring(0, 30) + '...' : entry.description,
      entry.type,
      entry.category,
      formatCurrency(entry.amount)
    ])
    
    const tableHeaders = ['Date', 'Description', 'Type', 'Category', 'Amount']
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 130,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [226, 232, 240],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [52, 78, 128],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'left' }, // Date
        1: { cellWidth: 55, halign: 'left' }, // Description
        2: { cellWidth: 25, halign: 'center' }, // Type
        3: { cellWidth: 30, halign: 'left' }, // Category
        4: { cellWidth: 30, halign: 'right' }  // Amount
      }
    })
  }
  
  // Add professional footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Footer background
    doc.setFillColor(248, 250, 252)
    doc.rect(0, doc.internal.pageSize.height - 20, 210, 20, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(0, doc.internal.pageSize.height - 20, 210, 20, 'D')
    
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 10)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 120, doc.internal.pageSize.height - 10)
    doc.text('MENTORSCUE Financial Dashboard', 20, doc.internal.pageSize.height - 5)
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