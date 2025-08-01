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
        lineColor?: number[]
        lineWidth?: number
        fontStyle?: string
      }
      headStyles?: {
        fillColor?: number[]
        textColor?: number
        fontStyle?: string
        halign?: string
        fontSize?: number
      }
      columnStyles?: {
        [key: number]: {
          cellWidth?: number
          halign?: string
        }
      }
      didDrawPage?: (data: { pageNumber: number }) => void
      margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
      }
      pageBreak?: 'auto' | 'avoid' | 'always'
      alternateRowStyles?: {
        fillColor?: number[]
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
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  const margin = 20
  
  // Clean professional header
  const headerY = 30
  
  // Logo with correct colors
  doc.setFontSize(28)
  doc.setTextColor(52, 78, 128) // #344e80
  doc.text('MENTORS', margin, headerY)
  doc.setTextColor(67, 162, 76) // #43a24c
  doc.text('CUE', margin + 70, headerY)
  
  // Subtitle
  doc.setFontSize(16)
  doc.setTextColor(75, 85, 99) // Gray-600
  doc.text('Financial Records', margin, headerY + 12)
  
  // Report details on the right
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
  
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128) // Gray-500
  doc.text(`Generated: ${currentDate}`, pageWidth - margin, headerY - 5, { align: 'right' })
  
  // Filter information
  const filterText = getFilterDescription(filters)
  doc.text(`Period: ${filterText}`, pageWidth - margin, headerY + 5, { align: 'right' })
  
  // Summary section with clean design
  const summaryY = headerY + 35
  const cardWidth = 55
  const cardHeight = 20
  const cardSpacing = 5
  
  // Income summary
  doc.setFillColor(34, 197, 94) // Green
  doc.rect(margin, summaryY, cardWidth, cardHeight, 'F')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Income', margin + 5, summaryY + 8)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrencyForDisplay(totals.income), margin + 5, summaryY + 15)
  
  // Expense summary
  doc.setFillColor(239, 68, 68) // Red
  doc.rect(margin + cardWidth + cardSpacing, summaryY, cardWidth, cardHeight, 'F')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Expense', margin + cardWidth + cardSpacing + 5, summaryY + 8)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrencyForDisplay(totals.expense), margin + cardWidth + cardSpacing + 5, summaryY + 15)
  
  // Balance summary
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(margin + (cardWidth + cardSpacing) * 2, summaryY, cardWidth, cardHeight, 'F')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Balance', margin + (cardWidth + cardSpacing) * 2 + 5, summaryY + 8)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrencyForDisplay(totals.balance), margin + (cardWidth + cardSpacing) * 2 + 5, summaryY + 15)
  
  // Reset font
  doc.setFont('helvetica', 'normal')
  
  // Section divider
  const dividerY = summaryY + cardHeight + 15
  doc.setDrawColor(229, 231, 235) // Gray-200
  doc.setLineWidth(0.5)
  doc.line(margin, dividerY, pageWidth - margin, dividerY)
  
  // Transaction details header
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55) // Gray-800
  doc.text('Transaction Details', margin, dividerY + 15)
  
  // Prepare table data
  const tableHeaders = ['#', 'Date', 'Description', 'Type', 'Category', 'Amount', 'Created By']
  const tableData = entries.map((entry, index) => [
    (index + 1).toString(),
    new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
    entry.description.length > 40 ? entry.description.substring(0, 40) + '...' : entry.description,
    entry.type,
    entry.category,
    formatCurrency(entry.amount),
    entry.user_email || 'Unknown'
  ])
  
  // Smart table with professional styling
  const tableY = dividerY + 25
  
  if (entries.length > 0) {
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: tableY,
      margin: { top: 10, right: margin, bottom: 20, left: margin },
      styles: {
        fontSize: 9,
        cellPadding: 6,
        lineColor: [229, 231, 235],
        lineWidth: 0.3,
        fontStyle: 'normal'
      },
      headStyles: {
        fillColor: [249, 250, 251],
        textColor: [31, 41, 55],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // #
        1: { cellWidth: 25, halign: 'center' }, // Date
        2: { cellWidth: 45, halign: 'left' },   // Description
        3: { cellWidth: 25, halign: 'center' }, // Type
        4: { cellWidth: 30, halign: 'left' },   // Category
        5: { cellWidth: 35, halign: 'right' },  // Amount
        6: { cellWidth: 40, halign: 'left' }    // Created By
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      pageBreak: 'auto',
              didDrawPage: function() {
          // Footer on every page
          const pageNumber = doc.getCurrentPageInfo().pageNumber
          const totalPages = doc.getNumberOfPages()
        
        doc.setFontSize(8)
        doc.setTextColor(156, 163, 175)
        doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: 'center' })
        doc.text(`MENTORS CUE Financial Records`, pageWidth / 2, pageHeight - 10, { align: 'center' })
        doc.text(`Generated on ${currentDate}`, pageWidth / 2, pageHeight - 5, { align: 'center' })
      }
    })
  } else {
    // No entries message
    doc.setFontSize(12)
    doc.setTextColor(156, 163, 175)
    doc.text('No transactions found for the selected filters.', pageWidth / 2, tableY + 20, { align: 'center' })
  }
  
  // Generate filename with date
  const fileName = `MENTORSCUE-Financial-Records-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

const getFilterDescription = (filters: { dateRange: string; startDate?: string; endDate?: string; type?: string; category?: string }): string => {
  const parts = []
  
  // Date range
  switch (filters.dateRange) {
    case 'current-month':
      const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      parts.push(currentMonth)
      break
    case 'last-month':
      const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      parts.push(lastMonth)
      break
    case 'last-3-months':
      parts.push('Last 3 Months')
      break
    case 'current-year':
      parts.push(new Date().getFullYear().toString())
      break
    case 'custom':
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        const end = new Date(filters.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
        parts.push(`${start} - ${end}`)
      }
      break
    default:
      parts.push('All Time')
  }
  
  // Type filter
  if (filters.type && filters.type !== 'All') {
    parts.push(filters.type)
  }
  
  // Category filter
  if (filters.category && filters.category !== '') {
    parts.push(filters.category)
  }
  
  return parts.join(' • ')
}