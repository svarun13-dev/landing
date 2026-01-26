'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { TrendingUp, TrendingDown, Settings, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { NumberInput } from '@/components/ui'
import { formatUSD, cn } from '@/lib/utils'
import { usePerpTradeStore } from '@/lib/store'
import { useOpenPosition } from '@/lib/hooks'

interface PerpTradePanelProps {
  asset: string
  price: number
}

const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20, 50]

export function PerpTradePanel({ asset, price }: PerpTradePanelProps) {
  const { isConnected } = useAccount()
  const {
    side,
    size,
    leverage,
    orderType,
    limitPrice,
    stopLoss,
    takeProfit,
    isSubmitting,
    setSide,
    setSize,
    setLeverage,
    setOrderType,
    setLimitPrice,
    setStopLoss,
    setTakeProfit,
  } = usePerpTradeStore()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const openPosition = useOpenPosition()

  const sizeValue = parseFloat(size) || 0
  const margin = sizeValue * price / leverage
  const notionalValue = sizeValue * price
  const liquidationPrice =
    side === 'long'
      ? price * (1 - 0.9 / leverage)
      : price * (1 + 0.9 / leverage)

  const handleSubmit = async () => {
    if (!isConnected || isSubmitting || !size) return

    try {
      await openPosition.mutateAsync({
        symbol: asset,
        side,
        size: sizeValue,
        leverage,
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      })
      alert('Position opened successfully!')
    } catch (error) {
      console.error('Failed to open position:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Perpetual</CardTitle>
        <Badge variant="outline" className="font-mono">
          Hyperliquid
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Side Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={side === 'long' ? 'success' : 'outline'}
            onClick={() => setSide('long')}
            className={cn(
              'flex items-center justify-center gap-2',
              side === 'long' && 'bg-success hover:bg-success/90'
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Long
          </Button>
          <Button
            variant={side === 'short' ? 'destructive' : 'outline'}
            onClick={() => setSide('short')}
            className={cn(
              side === 'short' && 'bg-destructive hover:bg-destructive/90'
            )}
          >
            <TrendingDown className="h-4 w-4" />
            Short
          </Button>
        </div>

        {/* Order Type */}
        <Tabs value={orderType} onChange={(v) => setOrderType(v as 'market' | 'limit')}>
          <TabsList className="w-full">
            <TabsTrigger value="market" className="flex-1">
              Market
            </TabsTrigger>
            <TabsTrigger value="limit" className="flex-1">
              Limit
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Limit Price */}
        {orderType === 'limit' && (
          <NumberInput
            label="Limit Price"
            value={limitPrice}
            onChange={setLimitPrice}
            placeholder={price.toFixed(2)}
            rightElement={<span className="text-muted-foreground">USD</span>}
          />
        )}

        {/* Size */}
        <NumberInput
          label="Size"
          value={size}
          onChange={setSize}
          placeholder="0.00"
          rightElement={<span className="text-muted-foreground">{asset}</span>}
        />

        {/* Leverage Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Leverage
            </label>
            <span className="text-sm font-bold text-primary">{leverage}x</span>
          </div>
          <div className="flex gap-1">
            {LEVERAGE_OPTIONS.map((l) => (
              <button
                key={l}
                onClick={() => setLeverage(l)}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-xs font-medium transition-colors',
                  leverage === l
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {l}x
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
        >
          <span className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced Options
          </span>
          <span>{showAdvanced ? '−' : '+'}</span>
        </button>

        {showAdvanced && (
          <div className="space-y-3 rounded-lg border border-border p-3">
            <NumberInput
              label="Stop Loss"
              value={stopLoss}
              onChange={setStopLoss}
              placeholder="Optional"
              rightElement={<span className="text-muted-foreground">USD</span>}
            />
            <NumberInput
              label="Take Profit"
              value={takeProfit}
              onChange={setTakeProfit}
              placeholder="Optional"
              rightElement={<span className="text-muted-foreground">USD</span>}
            />
          </div>
        )}

        {/* Position Summary */}
        {sizeValue > 0 && (
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="text-foreground">{formatUSD(price)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Notional Value</span>
              <span className="text-foreground">{formatUSD(notionalValue)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Required Margin</span>
              <span className="text-foreground">{formatUSD(margin)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Liquidation Price</span>
              <span className="text-warning">{formatUSD(liquidationPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fee (0.01%)</span>
              <span className="text-foreground">
                {formatUSD(notionalValue * 0.0001)}
              </span>
            </div>
          </div>
        )}

        {/* Liquidation Warning */}
        {leverage >= 20 && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/5 p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
            <p className="text-xs text-muted-foreground">
              High leverage ({leverage}x) significantly increases liquidation risk.
              Position will be liquidated if price moves{' '}
              {(100 / leverage).toFixed(1)}% against you.
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button onClick={openConnectModal} className="w-full" size="lg">
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!size || sizeValue <= 0 || openPosition.isPending}
            isLoading={openPosition.isPending}
            variant={side === 'long' ? 'success' : 'destructive'}
            className="w-full"
            size="lg"
          >
            {openPosition.isPending
              ? 'Opening Position...'
              : sizeValue <= 0
                ? 'Enter size'
                : `${side === 'long' ? 'Long' : 'Short'} ${asset} ${leverage}x`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
