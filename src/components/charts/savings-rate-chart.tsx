'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'
import { SavingsRateData } from '@/types'
import '@/lib/chart-config'

interface SavingsRateChartProps {
  data: SavingsRateData
}

export function SavingsRateChart({ data }: SavingsRateChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Savings Rate (%)',
        data: data.data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
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
            return `Savings Rate: ${tooltipItem.parsed.y.toFixed(1)}%`
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
          text: 'Savings Rate (%)',
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
      <Line data={chartData} options={options} />
    </div>
  )
}