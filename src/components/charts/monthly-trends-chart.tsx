'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'
import { MonthlyData } from '@/types'
import '@/lib/chart-config'

interface MonthlyTrendsChartProps {
  data: MonthlyData
  visibleDatasets: ('income' | 'expenses' | 'balance')[]
}

export function MonthlyTrendsChart({ data, visibleDatasets }: MonthlyTrendsChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Income',
        data: data.income,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        hidden: !visibleDatasets.includes('income'),
      },
      {
        label: 'Expenses',
        data: data.expenses,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: false,
        hidden: !visibleDatasets.includes('expenses'),
      },
      {
        label: 'Net Balance',
        data: data.balance,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
        hidden: !visibleDatasets.includes('balance'),
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(this: unknown, tooltipItem: { dataset: { label?: string }, parsed: { y: number } }) {
            return `${tooltipItem.dataset.label || 'Unknown'}: ₹${tooltipItem.parsed.y.toLocaleString()}`
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
        },
      },
      y: {
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Amount (₹)',
        },
        ticks: {
          callback: function(this: unknown, value: number | string) {
            return typeof value === 'number' ? '₹' + value.toLocaleString() : value
          },
        },
      },
    },
  }

  return (
    <div className="h-[300px] w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}