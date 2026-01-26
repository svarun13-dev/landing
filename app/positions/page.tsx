'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  ArrowUpRight,
  ArrowDownRight,
  X,
  Edit2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui'
import { formatUSD, formatPercent, cn, getTimeAgo } from '@/lib/utils'
import { usePositions, useClosePosition, useModifyPosition } from '@/lib/hooks'
import type { PerpPosition } from '@/lib/providers/types'

export default function PositionsPage() {
  const { isConnected } = useAccount()
  const {
    positions,
    totalMargin,
    totalUnrealizedPnl,
    isLoading,
  } = usePositions()
  const closePosition = useClosePosition()
  const modifyPosition = useModifyPosition()

  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState<string | null>(null)

  const handleClosePosition = async (positionId: string) => {
    setIsClosing(positionId)
    try {
      await closePosition.mutateAsync(positionId)
    } finally {
      setIsClosing(null)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Wallet className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-muted-foreground mb-6">
          Connect your wallet to view and manage your perp positions
        </p>
        <ConnectButton />
      </div>
    )
  }

  const totalPnlPositive = totalUnrealizedPnl >= 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Positions</h2>
        <p className="text-muted-foreground mt-1">
          Manage your perpetual positions on Hyperliquid
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {positions.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatUSD(totalMargin)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Unrealized P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {totalPnlPositive ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  totalPnlPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {totalPnlPositive ? '+' : ''}
                {formatUSD(totalUnrealizedPnl)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card padding="none">
        <CardHeader className="px-6 pt-6">
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-3 w-32" />
                  </div>
                  <div className="skeleton h-8 w-20" />
                </div>
              ))}
            </div>
          ) : positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">
                No open positions
              </p>
              <p className="text-muted-foreground mt-1">
                Open a perpetual position to get started
              </p>
              <a href="/trade">
                <Button className="mt-4">Open Position</Button>
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Asset</th>
                    <th className="px-6 py-4 font-medium">Side</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Size / Leverage
                    </th>
                    <th className="px-6 py-4 font-medium text-right">Entry</th>
                    <th className="px-6 py-4 font-medium text-right">Mark</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Liq. Price
                    </th>
                    <th className="px-6 py-4 font-medium text-right">Margin</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Unrealized P&L
                    </th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <PositionRow
                      key={position.id}
                      position={position}
                      isClosing={isClosing === position.id}
                      onClose={() => handleClosePosition(position.id)}
                      onModify={() => setSelectedPosition(position.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Warning */}
      {positions.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex gap-3 pt-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-medium text-warning">Liquidation Risk</p>
              <p className="text-muted-foreground mt-1">
                Monitor your positions closely. Positions will be liquidated if
                the mark price reaches your liquidation price. Consider adding
                stop losses to protect against large losses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PositionRow({
  position,
  isClosing,
  onClose,
  onModify,
}: {
  position: PerpPosition
  isClosing: boolean
  onClose: () => void
  onModify: () => void
}) {
  const isPositive = position.unrealizedPnl >= 0
  const isLong = position.side === 'long'

  // Calculate distance to liquidation
  const distanceToLiq = isLong
    ? ((position.markPrice - position.liquidationPrice) / position.markPrice) * 100
    : ((position.liquidationPrice - position.markPrice) / position.markPrice) * 100

  const isNearLiquidation = distanceToLiq < 10

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-secondary/30">
      {/* Asset */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <span className="text-sm font-bold text-foreground">
              {position.symbol.slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground">{position.symbol}</p>
            <p className="text-xs text-muted-foreground">
              {getTimeAgo(new Date(position.timestamp))}
            </p>
          </div>
        </div>
      </td>

      {/* Side */}
      <td className="px-6 py-4">
        <Badge variant={isLong ? 'success' : 'destructive'}>
          {position.side.toUpperCase()}
        </Badge>
      </td>

      {/* Size / Leverage */}
      <td className="px-6 py-4 text-right">
        <p className="font-medium text-foreground tabular-nums">
          {position.size.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">{position.leverage}x</p>
      </td>

      {/* Entry */}
      <td className="px-6 py-4 text-right text-muted-foreground tabular-nums">
        {formatUSD(position.entryPrice)}
      </td>

      {/* Mark */}
      <td className="px-6 py-4 text-right">
        <span className="font-medium text-foreground tabular-nums">
          {formatUSD(position.markPrice)}
        </span>
      </td>

      {/* Liquidation */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isNearLiquidation && (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          <span
            className={cn(
              'tabular-nums',
              isNearLiquidation ? 'text-warning' : 'text-muted-foreground'
            )}
          >
            {formatUSD(position.liquidationPrice)}
          </span>
        </div>
      </td>

      {/* Margin */}
      <td className="px-6 py-4 text-right text-foreground tabular-nums">
        {formatUSD(position.margin)}
      </td>

      {/* P&L */}
      <td className="px-6 py-4 text-right">
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
          <span className="tabular-nums">
            {formatUSD(Math.abs(position.unrealizedPnl))}
          </span>
        </div>
        <p
          className={cn(
            'text-xs',
            isPositive ? 'text-success' : 'text-destructive'
          )}
        >
          {formatPercent(position.unrealizedPnlPercent)}
        </p>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onModify}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onClose}
            isLoading={isClosing}
            className="h-8 px-3"
          >
            {isClosing ? 'Closing...' : 'Close'}
          </Button>
        </div>
      </td>
    </tr>
  )
}
