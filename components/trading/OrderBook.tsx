'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatNumber, cn } from '@/lib/utils'
import { useOrderBook } from '@/lib/hooks'

interface OrderBookProps {
  symbol: string
}

// Generate mock order book data
function generateMockOrderBook(midPrice: number): {
  bids: [number, number][]
  asks: [number, number][]
} {
  const bids: [number, number][] = []
  const asks: [number, number][] = []

  for (let i = 0; i < 10; i++) {
    const bidPrice = midPrice * (1 - 0.001 * (i + 1))
    const askPrice = midPrice * (1 + 0.001 * (i + 1))
    const bidSize = Math.random() * 100 + 10
    const askSize = Math.random() * 100 + 10

    bids.push([bidPrice, bidSize])
    asks.push([askPrice, askSize])
  }

  return { bids, asks }
}

export function OrderBook({ symbol }: OrderBookProps) {
  // In production, would use real order book data
  // const { data: orderBook, isLoading } = useOrderBook(symbol)

  // For MVP, use mock data
  const mockOrderBook = useMemo(() => generateMockOrderBook(178.72), [])

  const maxSize = Math.max(
    ...mockOrderBook.bids.map((b) => b[1]),
    ...mockOrderBook.asks.map((a) => a[1])
  )

  const spread = mockOrderBook.asks[0][0] - mockOrderBook.bids[0][0]
  const spreadPercent = (spread / mockOrderBook.bids[0][0]) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
          <span>Price (USD)</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (reversed so lowest ask is at bottom) */}
        <div className="space-y-0.5">
          {[...mockOrderBook.asks].reverse().map(([price, size], index) => {
            const total = mockOrderBook.asks
              .slice(0, mockOrderBook.asks.length - index)
              .reduce((sum, [, s]) => sum + s, 0)
            const percentage = (size / maxSize) * 100

            return (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 py-0.5 text-xs"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-destructive/10"
                  style={{ width: `${percentage}%` }}
                />
                <span className="relative text-destructive tabular-nums">
                  {formatNumber(price, { minimumFractionDigits: 2 })}
                </span>
                <span className="relative text-right text-foreground tabular-nums">
                  {formatNumber(size, { maximumFractionDigits: 2 })}
                </span>
                <span className="relative text-right text-muted-foreground tabular-nums">
                  {formatNumber(total, { maximumFractionDigits: 0 })}
                </span>
              </div>
            )
          })}
        </div>

        {/* Spread */}
        <div className="my-2 flex items-center justify-center gap-2 border-y border-border py-2">
          <span className="text-sm font-medium text-foreground tabular-nums">
            ${formatNumber(mockOrderBook.bids[0][0])}
          </span>
          <span className="text-xs text-muted-foreground">
            Spread: {spreadPercent.toFixed(3)}%
          </span>
        </div>

        {/* Bids */}
        <div className="space-y-0.5">
          {mockOrderBook.bids.map(([price, size], index) => {
            const total = mockOrderBook.bids
              .slice(0, index + 1)
              .reduce((sum, [, s]) => sum + s, 0)
            const percentage = (size / maxSize) * 100

            return (
              <div
                key={`bid-${index}`}
                className="relative grid grid-cols-3 py-0.5 text-xs"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-success/10"
                  style={{ width: `${percentage}%` }}
                />
                <span className="relative text-success tabular-nums">
                  {formatNumber(price, { minimumFractionDigits: 2 })}
                </span>
                <span className="relative text-right text-foreground tabular-nums">
                  {formatNumber(size, { maximumFractionDigits: 2 })}
                </span>
                <span className="relative text-right text-muted-foreground tabular-nums">
                  {formatNumber(total, { maximumFractionDigits: 0 })}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
