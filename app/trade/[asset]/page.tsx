'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowDownUp, Info, Zap, Shield, AlertTriangle } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { NumberInput } from '@/components/ui'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { usePrice, usePriceComparison } from '@/lib/hooks'
import { useTradeStore } from '@/lib/store'
import { PriceChart } from '@/components/charts/PriceChart'
import { TradePanel } from '@/components/trading/TradePanel'
import { PerpTradePanel } from '@/components/trading/PerpTradePanel'
import { VenueComparison } from '@/components/trading/VenueComparison'
import { OrderBook } from '@/components/trading/OrderBook'
import { CHAIN_NAMES, CHAIN_COLORS } from '@/config/chains'
import { getAssetsByUnderlying, type TokenizedAsset } from '@/config/assets'

export default function TradeAssetPage() {
  const params = useParams()
  const asset = params.asset as string
  const [tradeType, setTradeType] = useState<'spot' | 'perp'>('spot')

  const { price, isLoading: priceLoading } = usePrice(asset)
  const { comparison, isLoading: comparisonLoading } = usePriceComparison(asset)

  const assets = getAssetsByUnderlying(asset)
  const hasSpot = assets.some((a) => a.category === 'tokenized-spot')
  const hasPerp = assets.some((a) => a.category === 'perp')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <span className="text-xl font-bold text-foreground">
              {asset.slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{asset}</h1>
              {hasSpot && (
                <Badge variant="default" className="text-xs">
                  Spot
                </Badge>
              )}
              {hasPerp && (
                <Badge variant="secondary" className="text-xs">
                  Perp
                </Badge>
              )}
            </div>
            {price && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-semibold text-foreground tabular-nums">
                  {formatUSD(price.price)}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    price.change24h >= 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {formatPercent(price.change24h)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Trade Type Toggle */}
        {hasSpot && hasPerp && (
          <Tabs value={tradeType} onChange={(v) => setTradeType(v as 'spot' | 'perp')}>
            <TabsList>
              <TabsTrigger value="spot">Spot</TabsTrigger>
              <TabsTrigger value="perp">Perpetual</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart and Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Price Chart */}
          {price && <PriceChart symbol={asset} currentPrice={price.price} />}

          {/* Venue Comparison */}
          <VenueComparison
            underlying={asset}
            venues={comparison?.venues || []}
            isLoading={comparisonLoading}
          />

          {/* Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {assets.map((tokenAsset) => (
                  <div
                    key={tokenAsset.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {tokenAsset.symbol}
                      </span>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor:
                            CHAIN_COLORS[tokenAsset.providers[0]?.chainId],
                        }}
                      >
                        {CHAIN_NAMES[tokenAsset.providers[0]?.chainId]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tokenAsset.name}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Provider:{' '}
                        <span className="text-foreground capitalize">
                          {tokenAsset.providers[0]?.name}
                        </span>
                      </span>
                      {tokenAsset.providers[0]?.fees?.swap && (
                        <span>
                          Fee:{' '}
                          <span className="text-foreground">
                            {(tokenAsset.providers[0].fees.swap * 100).toFixed(2)}
                            %
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trade Panel */}
        <div className="space-y-6">
          {tradeType === 'spot' ? (
            <TradePanel asset={asset} price={price?.price || 0} />
          ) : (
            <PerpTradePanel asset={asset} price={price?.price || 0} />
          )}

          {/* Order Book (for perps) */}
          {tradeType === 'perp' && <OrderBook symbol={asset} />}

          {/* Warnings */}
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="flex gap-3 pt-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-warning">Trading Risk</p>
                <p className="mt-1">
                  Tokenized securities carry regulatory and counterparty risk.
                  Perpetual positions can be liquidated. Trade responsibly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
