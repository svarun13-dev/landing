'use client'

import { TrendingUp, TrendingDown, Wallet, PieChart, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { usePortfolio } from '@/lib/hooks'

export function PortfolioSummary() {
  const { totalValueUSD, pnl24h, pnlPercent24h, isLoading, isConnected } =
    usePortfolio()

  if (!isConnected) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">
            Connect your wallet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your wallet to view your portfolio
          </p>
        </CardContent>
      </Card>
    )
  }

  const isPositive = pnl24h >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="skeleton h-8 w-32" />
          ) : (
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatUSD(totalValueUSD)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 24h P&L */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            24h P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="skeleton h-8 w-24" />
          ) : (
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {formatUSD(Math.abs(pnl24h))}
              </p>
              <span
                className={cn(
                  'text-sm',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                ({formatPercent(pnlPercent24h)})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spot Holdings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Spot Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="skeleton h-8 w-28" />
          ) : (
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatUSD(totalValueUSD * 0.85)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perp Positions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Perp Margin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="skeleton h-8 w-24" />
          ) : (
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-warning" />
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatUSD(totalValueUSD * 0.15)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
