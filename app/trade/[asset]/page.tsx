'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import {
  Check, ArrowUpRight, ArrowDownRight, ArrowLeft,
  Shield, ExternalLink, Wallet,
} from 'lucide-react'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { ASSETS, VENUE_META, type VenueName } from '@/config/assets'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
)

// ─── Mock data ──────────────────────────────────────────

const MOCK_PRICES: Record<string, { price: number; change24h: number; change7d: number; volume: number }> = {
  AAPL:  { price: 178.72, change24h: 2.14,  change7d: 3.82,  volume: 58200000 },
  NVDA:  { price: 875.38, change24h: 4.21,  change7d: 8.15,  volume: 42100000 },
  TSLA:  { price: 177.48, change24h: -1.23, change7d: -3.41, volume: 91500000 },
  MSFT:  { price: 420.55, change24h: 1.35,  change7d: 2.67,  volume: 22300000 },
  AMZN:  { price: 178.25, change24h: 0.82,  change7d: 1.94,  volume: 35700000 },
  GOOGL: { price: 155.72, change24h: 1.67,  change7d: 4.11,  volume: 24500000 },
  META:  { price: 505.15, change24h: 3.45,  change7d: 5.23,  volume: 18900000 },
  COIN:  { price: 225.30, change24h: -2.15, change7d: -4.78, volume: 12400000 },
  SPY:   { price: 523.45, change24h: 0.87,  change7d: 1.52,  volume: 72000000 },
  OUSG:  { price: 104.52, change24h: 0.02,  change7d: 0.08,  volume: 5200000 },
  USDY:  { price: 1.06,   change24h: 0.01,  change7d: 0.03,  volume: 3100000 },
}

// Mock user position (bridges to Portfolio)
const MOCK_POSITIONS: Record<string, { quantity: number; avgEntry: number }> = {
  AAPL: { quantity: 12.5, avgEntry: 165.20 },
  NVDA: { quantity: 5.0,  avgEntry: 780.00 },
  SPY:  { quantity: 15.0, avgEntry: 498.30 },
  TSLA: { quantity: 8.0,  avgEntry: 192.15 },
  OUSG: { quantity: 100.0, avgEntry: 103.80 },
  MSFT: { quantity: 3.0,  avgEntry: 395.40 },
}

// Sparkline data (mock 24h points)
function generateSparkline(basePrice: number, change: number): number[] {
  const points: number[] = []
  const start = basePrice / (1 + change / 100)
  for (let i = 0; i < 24; i++) {
    const progress = i / 23
    const noise = (Math.sin(i * 1.7) * 0.003 + Math.sin(i * 0.4) * 0.005) * basePrice
    points.push(start + (basePrice - start) * progress + noise)
  }
  return points
}

function Sparkline({ data, positive, className }: { data: number[]; positive: boolean; className?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 200
  const h = 48
  const pad = 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('w-full h-12', className)} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? 'var(--success)' : 'var(--destructive)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function getVenuePrices(asset: typeof ASSETS[number], basePrice: number) {
  return asset.venues.map((v) => {
    const spread = (Math.random() - 0.5) * 0.004 * basePrice
    const price = basePrice + spread
    const fee = v.fees?.swap || v.fees?.mint || 0
    return {
      venue: v.name,
      tokenSymbol: v.tokenSymbol,
      price,
      fee,
      effectivePrice: price * (1 + fee),
      isBest: false,
    }
  }).sort((a, b) => a.effectivePrice - b.effectivePrice).map((v, i) => ({ ...v, isBest: i === 0 }))
}

// ─── Asset info metadata ────────────────────────────────

const ASSET_INFO: Record<string, { issuer: string; custodian: string; backing: string }> = {
  xstocks:    { issuer: 'xStocks Protocol', custodian: 'Prime Trust', backing: '1:1 backed by underlying equity' },
  ondo:       { issuer: 'Ondo Finance',     custodian: 'Clear Street', backing: '1:1 redeemable for underlying' },
  securitize: { issuer: 'Securitize LLC',   custodian: 'BNY Mellon', backing: 'SEC-registered digital security' },
}

export default function AssetDetailPage() {
  const params = useParams()
  const ticker = (params.asset as string).toUpperCase()
  const asset = ASSETS.find((a) => a.ticker === ticker)
  const [amount, setAmount] = useState('')
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const { connected } = useWallet()

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-lg font-medium text-foreground mb-2">Asset not found</p>
        <Link href="/markets" className="text-[13px] text-primary hover:underline">Back to Markets</Link>
      </div>
    )
  }

  const priceData = MOCK_PRICES[ticker] || { price: 100, change24h: 0, change7d: 0, volume: 0 }
  const venuePrices = getVenuePrices(asset, priceData.price)
  const active = (selectedVenue || venuePrices[0]?.venue) as VenueName
  const position = MOCK_POSITIONS[ticker]
  const sparkData = generateSparkline(priceData.price, priceData.change24h)
  const isUp24h = priceData.change24h >= 0
  const isUp7d = priceData.change7d >= 0

  // Best venue info for the active venue
  const activeVenueInfo = ASSET_INFO[active] || ASSET_INFO.xstocks

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/markets"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Markets
      </Link>

      {/* ─── Header: Identity + Price ─────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-[13px] font-bold text-foreground">
            {ticker.slice(0, 2)}
            {position && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary" title="In your portfolio">
                <Wallet className="h-2 w-2 text-white" />
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{asset.name}</h1>
            <p className="text-[12px] text-muted-foreground">
              {asset.ticker} &middot; {asset.sector} &middot; <span className="capitalize">{asset.type}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground tabular-nums">{formatUSD(priceData.price)}</p>
          <div className="flex items-center justify-end gap-3 mt-0.5">
            <span className={cn('inline-flex items-center gap-0.5 text-[12px] tabular-nums font-medium', isUp24h ? 'text-success' : 'text-destructive')}>
              {isUp24h ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formatPercent(priceData.change24h)}
              <span className="text-muted-foreground font-normal ml-0.5">24h</span>
            </span>
            <span className={cn('inline-flex items-center gap-0.5 text-[12px] tabular-nums font-medium', isUp7d ? 'text-success' : 'text-destructive')}>
              {isUp7d ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formatPercent(priceData.change7d)}
              <span className="text-muted-foreground font-normal ml-0.5">7d</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Sparkline ────────────────────────────────────── */}
      <div className="border border-border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">24h Price</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            Vol: ${(priceData.volume / 1e6).toFixed(1)}M
          </span>
        </div>
        <Sparkline data={sparkData} positive={isUp24h} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {/* ─── Venue Comparison (Core) ───────────────────── */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-foreground">Venue Comparison</h2>
              <span className="text-[11px] text-muted-foreground">{asset.venues.length} {asset.venues.length === 1 ? 'venue' : 'venues'}</span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium border-b border-border/30">
              <span>Venue</span>
              <span className="text-right w-20">Price</span>
              <span className="text-right w-16">Fee</span>
              <span className="text-right w-24">Effective</span>
            </div>

            <div className="divide-y divide-border/50">
              {venuePrices.map((v) => (
                <button
                  key={v.venue}
                  onClick={() => setSelectedVenue(v.venue)}
                  className={cn(
                    'w-full grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 transition-colors text-left',
                    active === v.venue ? 'bg-accent/50' : 'hover:bg-accent/30'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-foreground">{VENUE_META[v.venue]?.label}</span>
                    {v.isBest && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-success/10 text-success">
                        <Check className="h-2.5 w-2.5" /> Best
                      </span>
                    )}
                  </div>
                  <span className="text-right w-20 text-[13px] text-foreground tabular-nums">{formatUSD(v.price)}</span>
                  <span className="text-right w-16 text-[11px] text-muted-foreground tabular-nums">{(v.fee * 100).toFixed(2)}%</span>
                  <span className="text-right w-24 text-[13px] text-foreground tabular-nums font-medium">{formatUSD(v.effectivePrice)}</span>
                </button>
              ))}
            </div>

            <div className="px-5 py-2 border-t border-border/30">
              <p className="text-[10px] text-muted-foreground/60">
                Best = lowest effective price (price + fees). Prices update in real-time.
              </p>
            </div>
          </div>

          {/* ─── Your Position (only if held) ─────────────── */}
          {position && (
            <div className="border border-border rounded-lg bg-card px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Your Position</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 text-[13px]">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Quantity</p>
                  <p className="text-foreground font-medium tabular-nums">{position.quantity.toFixed(2)} {ticker}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Avg Entry</p>
                  <p className="text-foreground font-medium tabular-nums">{formatUSD(position.avgEntry)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">Unrealized PnL</p>
                  {(() => {
                    const pnl = (priceData.price - position.avgEntry) * position.quantity
                    const pnlPct = ((priceData.price - position.avgEntry) / position.avgEntry) * 100
                    const up = pnl >= 0
                    return (
                      <p className={cn('font-medium tabular-nums', up ? 'text-success' : 'text-destructive')}>
                        {up ? '+' : ''}{formatUSD(pnl)} ({formatPercent(pnlPct)})
                      </p>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ─── Asset Info (Trust Layer) ─────────────────── */}
          <div className="border border-border rounded-lg bg-card px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Asset Information</h3>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground capitalize">{asset.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sector</span>
                <span className="text-foreground">{asset.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issuer</span>
                <span className="text-foreground">{activeVenueInfo.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custodian</span>
                <span className="text-foreground">{activeVenueInfo.custodian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backing</span>
                <span className="text-foreground text-right max-w-[180px]">{activeVenueInfo.backing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain</span>
                <span className="text-foreground">Solana</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed max-w-sm">
                Tokenized representations are issued by independent venues and backed 1:1 by the underlying asset.
              </p>
              <a
                href={VENUE_META[active]?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                Issuer docs <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ─── Buy Panel (Sticky Sidebar) ─────────────────── */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-lg bg-card overflow-hidden sticky top-6">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-[13px] font-medium text-foreground">Buy {asset.name}</h2>
              <span className="text-[10px] text-muted-foreground">
                via {VENUE_META[active]?.label}
              </span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1.5 w-full h-10 rounded-md border border-border bg-background px-3 text-[15px] text-foreground tabular-nums placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="rounded-md bg-accent/50 px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">You receive (est.)</span>
                    <span className="text-foreground font-medium tabular-nums">
                      {(parseFloat(amount) / priceData.price).toFixed(4)} {ticker}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Via</span>
                    <span className="text-foreground">{VENUE_META[active]?.label}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="text-foreground tabular-nums">
                      ~{formatUSD(parseFloat(amount) * (venuePrices.find((v) => v.venue === active)?.fee || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] pt-1.5 border-t border-border/30">
                    <span className="text-muted-foreground">Effective price</span>
                    <span className="text-foreground font-medium tabular-nums">
                      {formatUSD(venuePrices.find((v) => v.venue === active)?.effectivePrice || priceData.price)}
                    </span>
                  </div>
                </div>
              )}

              {connected ? (
                <button className="w-full h-10 rounded-md bg-primary text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  {amount && parseFloat(amount) > 0 ? `Buy ${asset.name}` : 'Enter Amount'}
                </button>
              ) : (
                <WalletMultiButton style={{
                  width: '100%',
                  justifyContent: 'center',
                  backgroundColor: 'var(--primary)',
                  height: '40px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                }} />
              )}

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Routes through {VENUE_META[active]?.label} on Solana. Actual execution price may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
