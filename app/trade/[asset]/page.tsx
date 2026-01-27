'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, ExternalLink, Check } from 'lucide-react'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { ASSETS, VENUE_META, type Asset, type VenueName } from '@/config/assets'
import { CHAIN_NAMES, CHAIN_COLORS } from '@/config/chains'

const MOCK_PRICES: Record<string, number> = {
  AAPL: 178.72, NVDA: 875.38, TSLA: 177.48, MSFT: 420.55, AMZN: 178.25,
  GOOGL: 155.72, META: 505.15, COIN: 225.30, SPY: 523.45, OUSG: 104.52,
  USDY: 1.06, BIB01: 109.85,
}

// Simulated venue prices with slight differences
function getVenuePrices(asset: Asset, basePrice: number) {
  return asset.venues.map((v, i) => {
    const spread = (Math.random() - 0.5) * 0.004 * basePrice
    const price = basePrice + spread
    const fee = v.fees?.swap || v.fees?.mint || 0
    return {
      venue: v.name,
      chainId: v.chainId,
      tokenSymbol: v.tokenSymbol,
      price,
      fee,
      effectivePrice: price * (1 + fee),
      isBest: false,
    }
  }).sort((a, b) => a.effectivePrice - b.effectivePrice).map((v, i) => ({ ...v, isBest: i === 0 }))
}

export default function TradeAssetPage() {
  const params = useParams()
  const ticker = (params.asset as string).toUpperCase()
  const asset = ASSETS.find((a) => a.ticker === ticker)
  const [amount, setAmount] = useState('')
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-lg font-medium text-foreground mb-2">Asset not found</p>
        <Link href="/markets" className="text-[13px] text-primary hover:underline">
          Back to Markets
        </Link>
      </div>
    )
  }

  const basePrice = MOCK_PRICES[ticker] || 100
  const venuePrices = getVenuePrices(asset, basePrice)
  const active = selectedVenue || venuePrices[0]?.venue

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/markets" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              Markets
            </Link>
            <span className="text-muted-foreground">/</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-[13px] font-semibold text-foreground">
              {ticker.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{asset.name}</h1>
              <p className="text-[13px] text-muted-foreground">
                {asset.ticker} &middot; {asset.sector} &middot; {asset.description}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground tabular-nums">{formatUSD(basePrice)}</p>
          <p className="text-[13px] text-success tabular-nums">+2.14% <span className="text-muted-foreground">24h</span></p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Venue Comparison - left side */}
        <div className="lg:col-span-3 space-y-6">
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-foreground">Price Comparison Across Venues</h2>
              <span className="text-[11px] text-muted-foreground">{asset.venues.length} venues available</span>
            </div>
            <div className="divide-y divide-border">
              {venuePrices.map((v) => (
                <button
                  key={v.venue + v.chainId}
                  onClick={() => setSelectedVenue(v.venue)}
                  className={cn(
                    'w-full flex items-center justify-between px-5 py-4 transition-colors text-left',
                    active === v.venue ? 'bg-accent/50' : 'hover:bg-accent/30'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-foreground">{VENUE_META[v.venue]?.label}</p>
                        {v.isBest && (
                          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-success/10 text-success">
                            <Check className="h-2.5 w-2.5" />
                            Best Price
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS[v.chainId] }} />
                          {CHAIN_NAMES[v.chainId]}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Token: {v.tokenSymbol}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-medium text-foreground tabular-nums">{formatUSD(v.price)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Fee: {(v.fee * 100).toFixed(2)}% &middot; Eff: {formatUSD(v.effectivePrice)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Underlying Info */}
          <div className="border border-border rounded-lg bg-card px-5 py-4">
            <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Underlying Asset Details</h3>
            <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Underlying</span>
                <span className="text-foreground font-medium">{asset.ticker} ({asset.name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground capitalize">{asset.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sector</span>
                <span className="text-foreground">{asset.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venues</span>
                <span className="text-foreground">{asset.venues.length} providers</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t border-border pt-3">
              Tokenized representations are issued by independent venues and backed 1:1 by the underlying asset.
              Each venue operates under its own regulatory framework. OnChain Broker aggregates prices and routes
              orders but does not custody assets.
            </p>
          </div>
        </div>

        {/* Trade Panel - right side */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-lg bg-card overflow-hidden sticky top-6">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-[13px] font-medium text-foreground">Buy {asset.name}</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Amount Input */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 w-full h-10 rounded-md border border-border bg-background px-3 text-[15px] text-foreground tabular-nums placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>

              {/* Estimated Output */}
              {amount && parseFloat(amount) > 0 && (
                <div className="rounded-md bg-accent/50 px-4 py-3">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">You receive (est.)</span>
                    <span className="text-foreground font-medium tabular-nums">
                      {(parseFloat(amount) / basePrice).toFixed(4)} {ticker}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] mt-1">
                    <span className="text-muted-foreground">Via</span>
                    <span className="text-foreground">{VENUE_META[active as VenueName]?.label}</span>
                  </div>
                  <div className="flex justify-between text-[12px] mt-1">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="text-foreground tabular-nums">
                      ~{formatUSD(parseFloat(amount) * (venuePrices.find((v) => v.venue === active)?.fee || 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button className="w-full h-10 rounded-md bg-primary text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                {amount && parseFloat(amount) > 0
                  ? 'Buy ' + asset.name
                  : 'Enter Amount'}
              </button>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Routes through {VENUE_META[active as VenueName]?.label} on {CHAIN_NAMES[venuePrices.find((v) => v.venue === active)?.chainId || 1]}.
                Actual execution price may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
