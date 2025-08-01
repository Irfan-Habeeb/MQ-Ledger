'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'
import { ExpenseRatioData } from '@/types'
import '@/lib/chart-config'

interface ExpenseRatioChartProps {
  data: ExpenseRatioData
}

export function ExpenseRatioChart({ data }: ExpenseRatioChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Expense Ratio (%)',
        data: data.data,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
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
          label: function(this: unknown, tooltipItem: { parsed: { y: number } }) {
            return `Expense Ratio: ${tooltipItem.parsed.y.toFixed(1)}%`
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
          text: 'Expense Ratio (%)',
        },
        min: 0,
        max: 100,
        ticks: {
          callback: function(this: unknown, value: number | string) {
            return typeof value === 'number' ? value + '%' : value
          },
        },
      },
    },
  }

  return (
    <div className="h-[300px] w-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}