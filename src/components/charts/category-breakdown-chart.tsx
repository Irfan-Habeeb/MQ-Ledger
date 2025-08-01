'use client'

import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { CategoryData } from '@/types'
import { getCategoryColor } from '@/lib/utils'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

interface CategoryBreakdownChartProps {
  data: CategoryData
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: data.labels.map((_, index) => getCategoryColor(index)),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function(this: unknown, tooltipItem: { dataset: { data: number[] }, parsed: number, label?: string }) {
            const total = tooltipItem.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((tooltipItem.parsed / total) * 100).toFixed(1)
            return `${tooltipItem.label || 'Unknown'}: ₹${tooltipItem.parsed.toLocaleString()} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="h-[300px] w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}