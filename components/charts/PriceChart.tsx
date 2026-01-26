'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { formatUSD } from '@/lib/utils'

interface PriceChartProps {
  symbol: string
  currentPrice: number
}

// Generate mock historical data
function generateMockData(
  days: number,
  currentPrice: number
): { time: string; price: number }[] {
  const data = []
  const now = Date.now()
  const interval = (days * 24 * 60 * 60 * 1000) / 100 // 100 data points

  let price = currentPrice * (0.9 + Math.random() * 0.1) // Start 5-15% lower

  for (let i = 0; i < 100; i++) {
    const time = new Date(now - (100 - i) * interval)
    const change = (Math.random() - 0.48) * (currentPrice * 0.02) // Slight upward bias
    price = Math.max(price + change, currentPrice * 0.5)

    data.push({
      time: time.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: days <= 1 ? '2-digit' : undefined,
        minute: days <= 1 ? '2-digit' : undefined,
      }),
      price: parseFloat(price.toFixed(2)),
    })
  }

  // Ensure last price matches current
  data[data.length - 1].price = currentPrice

  return data
}

export function PriceChart({ symbol, currentPrice }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState('7d')
  const [data, setData] = useState<{ time: string; price: number }[]>([])

  useEffect(() => {
    const days =
      timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 365
    setData(generateMockData(days, currentPrice))
  }, [timeframe, currentPrice])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-medium text-foreground">
            {formatUSD(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const priceChange =
    data.length > 1
      ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100
      : 0
  const isPositive = priceChange >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{symbol} Price</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            <span className={isPositive ? 'text-success' : 'text-destructive'}>
              {isPositive ? '+' : ''}
              {priceChange.toFixed(2)}%
            </span>{' '}
            past {timeframe}
          </p>
        </div>
        <Tabs value={timeframe} onChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="24h">24H</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
            <TabsTrigger value="1y">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#22c55e' : '#ef4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
