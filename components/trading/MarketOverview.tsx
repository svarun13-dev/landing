'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { useAggregatedPrices } from '@/lib/hooks'
import { MiniChart } from '@/components/charts/MiniChart'

export function MarketOverview() {
  const { prices, isLoading } = useAggregatedPrices()

  // Get top movers
  const topMovers = [...prices]
    .sort((a, b) => {
      const aChange = Math.abs(a.prices[0]?.change24h || 0)
      const bChange = Math.abs(b.prices[0]?.change24h || 0)
      return bChange - aChange
    })
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Movers
        </CardTitle>
        <Link
          href="/markets"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-8 w-8 rounded-full" />
                  <div className="skeleton h-4 w-16" />
                </div>
                <div className="skeleton h-4 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topMovers.map((asset) => {
              const price = asset.prices[0]
              if (!price) return null

              const isPositive = price.change24h >= 0

              return (
                <Link
                  key={asset.symbol}
                  href={`/trade/${asset.underlying}`}
                  className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                      <span className="text-xs font-bold text-foreground">
                        {asset.underlying.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {asset.underlying}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatUSD(price.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MiniChart isPositive={isPositive} width={48} height={24} />
                    <div
                      className={cn(
                        'flex items-center gap-1 text-sm font-medium',
                        isPositive ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(price.change24h).toFixed(2)}%
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
