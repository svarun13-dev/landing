'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { usePositions } from '@/lib/hooks'

export function PositionsSummary() {
  const { positions, totalUnrealizedPnl, isLoading, isConnected } = usePositions()

  if (!isConnected) {
    return null
  }

  const totalPnlPositive = totalUnrealizedPnl >= 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-warning" />
            Open Perp Positions
          </CardTitle>
          {positions.length > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium',
                totalPnlPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              )}
            >
              {totalPnlPositive ? '+' : ''}
              {formatUSD(totalUnrealizedPnl)}
            </div>
          )}
        </div>
        <Link href="/positions">
          <Button variant="outline" size="sm">
            Manage Positions
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-20" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                </div>
                <div className="skeleton h-4 w-16" />
              </div>
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No open positions</p>
            <Link href="/trade">
              <Button variant="outline" size="sm" className="mt-4">
                Open a Position
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Side</th>
                  <th className="pb-3 font-medium text-right">Size</th>
                  <th className="pb-3 font-medium text-right">Entry</th>
                  <th className="pb-3 font-medium text-right">Mark</th>
                  <th className="pb-3 font-medium text-right">PnL</th>
                </tr>
              </thead>
              <tbody>
                {positions.slice(0, 5).map((position) => {
                  const isPositive = position.unrealizedPnl >= 0

                  return (
                    <tr
                      key={position.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                            <span className="text-xs font-bold">
                              {position.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-medium">{position.symbol}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={
                            position.side === 'long' ? 'success' : 'destructive'
                          }
                        >
                          {position.side.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {position.size.toFixed(2)} × {position.leverage}x
                      </td>
                      <td className="py-3 text-right tabular-nums text-muted-foreground">
                        {formatUSD(position.entryPrice)}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {formatUSD(position.markPrice)}
                      </td>
                      <td className="py-3 text-right">
                        <div
                          className={cn(
                            'flex items-center justify-end gap-1 font-medium',
                            isPositive ? 'text-success' : 'text-destructive'
                          )}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                          {formatUSD(Math.abs(position.unrealizedPnl))}
                          <span className="text-xs">
                            ({formatPercent(position.unrealizedPnlPercent)})
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
