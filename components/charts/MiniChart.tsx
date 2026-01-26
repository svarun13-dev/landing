'use client'

import { useMemo } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface MiniChartProps {
  data?: number[]
  isPositive?: boolean
  width?: number
  height?: number
}

export function MiniChart({
  data,
  isPositive = true,
  width = 80,
  height = 32,
}: MiniChartProps) {
  // Generate random data if none provided
  const chartData = useMemo(() => {
    if (data) {
      return data.map((value, index) => ({ value, index }))
    }

    // Generate semi-random data with trend
    const trend = isPositive ? 0.02 : -0.02
    const points = []
    let value = 100

    for (let i = 0; i < 24; i++) {
      value = value * (1 + trend + (Math.random() - 0.5) * 0.05)
      points.push({ value, index: i })
    }

    return points
  }, [data, isPositive])

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
