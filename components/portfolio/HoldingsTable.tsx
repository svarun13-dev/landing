'use client'

import { ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { formatUSD, formatNumber, cn } from '@/lib/utils'
import { usePortfolio } from '@/lib/hooks'
import { CHAIN_NAMES, CHAIN_COLORS } from '@/config/chains'

export function HoldingsTable() {
  const { balances, totalValueUSD, isLoading, isConnected } = usePortfolio()

  if (!isConnected) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-3 w-16" />
                </div>
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Chain</th>
                  <th className="pb-3 font-medium text-right">Balance</th>
                  <th className="pb-3 font-medium text-right">Value</th>
                  <th className="pb-3 font-medium text-right">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((holding) => {
                  const allocation =
                    totalValueUSD > 0
                      ? (holding.balanceUSD / totalValueUSD) * 100
                      : 0
                  const chainColor =
                    CHAIN_COLORS[holding.chainId] || '#6366f1'

                  return (
                    <tr
                      key={`${holding.symbol}-${holding.chainId}`}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                            <span className="text-sm font-bold text-foreground">
                              {holding.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {holding.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {holding.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="outline"
                          className="gap-1"
                          style={{ borderColor: chainColor }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: chainColor }}
                          />
                          {CHAIN_NAMES[holding.chainId] || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-4 text-right tabular-nums">
                        <span className="text-foreground">
                          {formatNumber(
                            parseFloat(holding.balance) /
                              10 ** holding.decimals
                          )}
                        </span>
                      </td>
                      <td className="py-4 text-right tabular-nums">
                        <span className="font-medium text-foreground">
                          {formatUSD(holding.balanceUSD)}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.min(allocation, 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-sm text-muted-foreground tabular-nums">
                            {allocation.toFixed(1)}%
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
