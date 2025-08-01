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
  
  // Professional header with modern design
  const headerHeight = 50
  const pageWidth = doc.internal.pageSize.width
  
  // Main header background with gradient effect
  doc.setFillColor(52, 78, 128) // #344e80
  doc.rect(0, 0, pageWidth, headerHeight, 'F')
  
  // Logo section with better typography
  doc.setFontSize(32)
  doc.setTextColor(255, 255, 255)
  doc.text('MENTORS', 25, 25)
  doc.setTextColor(67, 162, 76) // #43a24c
  doc.text('CUE', 95, 25)
  
  // Subtitle with better positioning
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('Financial Records', 25, 40)
  
  // Report metadata section
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  doc.setFontSize(10)
  doc.setTextColor(156, 163, 175)
  doc.text(`Report Generated: ${currentDate}`, pageWidth - 25, 15, { align: 'right' })
  
  // Filter information with professional styling
  const filterText = getFilterDescription(filters)
  doc.setTextColor(156, 163, 175)
  doc.text(`Filter: ${filterText}`, pageWidth - 25, 25, { align: 'right' })
  
  // Professional summary cards
  const summaryY = headerHeight + 20
  const cardHeight = 25
  const cardWidth = 60
  
  // Income card
  doc.setFillColor(34, 197, 94) // Green
  doc.rect(25, summaryY, cardWidth, cardHeight, 'F')
  doc.setDrawColor(34, 197, 94)
  doc.rect(25, summaryY, cardWidth, cardHeight, 'D')
  
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('Total Income', 30, summaryY + 8)
  doc.setFontSize(14)
  doc.setFontStyle('bold')
  doc.text(formatCurrencyForDisplay(totals.income), 30, summaryY + 18)
  
  // Expense card
  doc.setFillColor(239, 68, 68) // Red
  doc.rect(95, summaryY, cardWidth, cardHeight, 'F')
  doc.setDrawColor(239, 68, 68)
  doc.rect(95, summaryY, cardWidth, cardHeight, 'D')
  
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('Total Expenses', 100, summaryY + 8)
  doc.setFontSize(14)
  doc.setFontStyle('bold')
  doc.text(formatCurrencyForDisplay(totals.expense), 100, summaryY + 18)
  
  // Balance card
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(165, summaryY, cardWidth, cardHeight, 'F')
  doc.setDrawColor(59, 130, 246)
  doc.rect(165, summaryY, cardWidth, cardHeight, 'D')
  
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text('Net Balance', 170, summaryY + 8)
  doc.setFontSize(14)
  doc.setFontStyle('bold')
  doc.text(formatCurrencyForDisplay(totals.balance), 170, summaryY + 18)
  
  // Reset font
  doc.setFontStyle('normal')
  
  // Transaction details section
  const tableY = summaryY + cardHeight + 30
  
  // Section header
  doc.setFontSize(16)
  doc.setTextColor(31, 41, 55)
  doc.text('Transaction Details', 25, tableY - 10)
  
  // Add a subtle line under the section header
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(1)
  doc.line(25, tableY - 5, pageWidth - 25, tableY - 5)
  
  if (entries.length > 0) {
    const tableData = entries.map((entry, index) => [
      `${index + 1}`,
      new Date(entry.date).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: '2-digit' 
      }),
      entry.description.length > 35 ? entry.description.substring(0, 35) + '...' : entry.description,
      entry.type,
      entry.category,
      formatCurrency(entry.amount)
    ])
    
    const tableHeaders = ['#', 'Date', 'Description', 'Type', 'Category', 'Amount']
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: tableY,
      styles: {
        fontSize: 9,
        cellPadding: 6,
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
        fontStyle: 'normal'
      },
      headStyles: {
        fillColor: [52, 78, 128],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // #
        1: { cellWidth: 25, halign: 'center' }, // Date
        2: { cellWidth: 50, halign: 'left' }, // Description
        3: { cellWidth: 25, halign: 'center' }, // Type
        4: { cellWidth: 30, halign: 'left' }, // Category
        5: { cellWidth: 35, halign: 'right' }  // Amount
      },
      didDrawPage: function(data) {
        // Add page number and footer to each page
        const pageCount = doc.getNumberOfPages()
        const currentPage = data.pageNumber
        
        // Footer line
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.5)
        doc.line(25, doc.internal.pageSize.height - 30, pageWidth - 25, doc.internal.pageSize.height - 30)
        
        // Footer text
        doc.setFontSize(8)
        doc.setTextColor(107, 114, 128)
        doc.text(`Page ${currentPage} of ${pageCount}`, 25, doc.internal.pageSize.height - 20)
        doc.text('MENTORSCUE Financial Records', pageWidth - 25, doc.internal.pageSize.height - 20, { align: 'right' })
        doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, 25, doc.internal.pageSize.height - 15)
        doc.text(`Total Transactions: ${entries.length}`, pageWidth - 25, doc.internal.pageSize.height - 15, { align: 'right' })
      }
    })
  } else {
    // No entries message
    doc.setFontSize(12)
    doc.setTextColor(107, 114, 128)
    doc.text('No transactions found for the selected filters.', 25, tableY + 20)
  }
  
  // Save the PDF with better naming
  const fileName = `MENTORSCUE-Financial-Records-${new Date().toISOString().split('T')[0]}.pdf`
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