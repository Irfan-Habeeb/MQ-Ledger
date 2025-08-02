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
  
  // Logo as one single word with bold styling
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(52, 78, 128) // #344e80
  doc.text('MENTORS', margin, headerY)
  doc.setTextColor(67, 162, 76) // #43a24c
  doc.text('CUE', margin + 47, headerY) // Added 4px spacing between MENTORS and CUE
  
  // Subtitle with compact spacing
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99) // Gray-600
  doc.text('Financial Records', margin, headerY + 8)
  
  // Report details on the right with closer spacing
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })
  
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128) // Gray-500
  doc.text(`Generated: ${currentDate}`, pageWidth - margin, headerY - 2, { align: 'right' })
  
  // Filter information with closer spacing and dynamic period display
  const periodText = getDynamicPeriodText(filters)
  doc.text(`Period: ${periodText}`, pageWidth - margin, headerY + 8, { align: 'right' })
  
  // Summary section with clean design and compact spacing
  const summaryY = headerY + 25
  const cardWidth = 55
  const cardHeight = 20
  const cardSpacing = 5
  
  // Income summary - Dark green
  doc.setFillColor(21, 128, 61) // Dark green
  doc.rect(margin, summaryY, cardWidth, cardHeight, 'F')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Income', margin + 5, summaryY + 8)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrencyForDisplay(totals.income), margin + 5, summaryY + 15)
  
  // Expense summary - Dark red
  doc.setFillColor(185, 28, 28) // Dark red
  doc.rect(margin + cardWidth + cardSpacing, summaryY, cardWidth, cardHeight, 'F')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Expense', margin + cardWidth + cardSpacing + 5, summaryY + 8)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrencyForDisplay(totals.expense), margin + cardWidth + cardSpacing + 5, summaryY + 15)
  
  // Balance summary - Dynamic color based on value
  const balanceColor = totals.balance >= 0 ? [21, 128, 61] : [185, 28, 28] // Dark green if positive, dark red if negative
  doc.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2])
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
  const dividerY = summaryY + cardHeight + 10
  doc.setDrawColor(229, 231, 235) // Gray-200
  doc.setLineWidth(0.5)
  doc.line(margin, dividerY, pageWidth - margin, dividerY)
  
  // Transaction details header
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55) // Gray-800
  doc.text('Transaction Details', margin, dividerY + 12)
  
  // Prepare table data with color coding (no # column)
  const tableHeaders = ['Date', 'Description', 'Type', 'Category', 'Amount']
  const tableData = entries.map((entry) => [
    new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
    entry.description.length > 40 ? entry.description.substring(0, 40) + '...' : entry.description,
    entry.type,
    entry.category,
    formatCurrency(entry.amount)
  ])
  
  // Smart table with professional styling and centered layout
  const tableY = dividerY + 20
  const tableMargin = 15 // Professional margins
  
  if (entries.length > 0) {
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: tableY,
      margin: { top: 10, right: tableMargin, bottom: 20, left: tableMargin },
      tableWidth: pageWidth - (tableMargin * 2), // Ensure table fits within margins
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
          0: { cellWidth: 25, halign: 'center' }, // Date
          1: { cellWidth: 60, halign: 'left' },   // Description (reduced space)
          2: { cellWidth: 25, halign: 'center' }, // Type
          3: { cellWidth: 35, halign: 'left' },   // Category (added 5px)
          4: { cellWidth: 35, halign: 'right' }   // Amount
        },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      pageBreak: 'auto',
                      didDrawPage: function() {
          // Footer on every page - only page numbers
          const pageNumber = doc.getCurrentPageInfo().pageNumber
          const totalPages = doc.getNumberOfPages()
          
          doc.setFontSize(8)
          doc.setTextColor(156, 163, 175)
          doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
        },
        didParseCell: function(data) {
          // Color code amounts based on type
          if (data.column.index === 4) { // Amount column (now index 4 since we removed #)
            const entry = entries[data.row.index]
            if (entry.type === 'Income') {
              data.cell.styles.textColor = [21, 128, 61] // Dark green
            } else {
              data.cell.styles.textColor = [185, 28, 28] // Dark red
            }
          }
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

const getDynamicPeriodText = (filters: { dateRange: string; startDate?: string; endDate?: string; type?: string; category?: string }): string => {
  switch (filters.dateRange) {
    case 'current-month':
      const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      return `Month (${currentMonth})`
    case 'last-month':
      const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      return `Month (${lastMonth})`
    case 'previous-month':
      const previousMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      return `Month (${previousMonth})`
    case 'last-3-months':
      return 'Last 3 Months'
    case 'current-year':
      return `Year (${new Date().getFullYear()})`
    case 'custom':
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
        const end = new Date(filters.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
        return `From ${start} to ${end}`
      }
      return 'Custom Range'
    default:
      return 'All Time'
  }
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