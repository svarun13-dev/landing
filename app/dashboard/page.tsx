'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { VENUE_META, type VenueName } from '@/config/assets'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
)

const MOCK_HOLDINGS = [
  { ticker: 'AAPL', name: 'Apple', venue: 'xstocks' as VenueName, tokenSymbol: 'xAAPL', balance: 12.5, price: 178.72, change: 2.14 },
  { ticker: 'NVDA', name: 'NVIDIA', venue: 'securitize' as VenueName, tokenSymbol: 'sNVDA', balance: 5.0, price: 875.38, change: 4.21 },
  { ticker: 'SPY', name: 'S&P 500 ETF', venue: 'xstocks' as VenueName, tokenSymbol: 'xSPY', balance: 15.0, price: 523.45, change: 0.87 },
  { ticker: 'TSLA', name: 'Tesla', venue: 'xstocks' as VenueName, tokenSymbol: 'xTSLA', balance: 8.0, price: 177.48, change: -1.23 },
  { ticker: 'OUSG', name: 'US Gov Bond Fund', venue: 'ondo' as VenueName, tokenSymbol: 'OUSG', balance: 100.0, price: 104.52, change: 0.02 },
  { ticker: 'MSFT', name: 'Microsoft', venue: 'securitize' as VenueName, tokenSymbol: 'sMSFT', balance: 3.0, price: 420.55, change: 1.35 },
]

// Allocation by sector
function getAllocation() {
  const sectors: Record<string, number> = {}
  MOCK_HOLDINGS.forEach((h) => {
    const sector = h.ticker === 'SPY' ? 'Index' : h.ticker === 'OUSG' ? 'Fixed Income' : 'Technology'
    sectors[sector] = (sectors[sector] || 0) + h.balance * h.price
  })
  const total = Object.values(sectors).reduce((s, v) => s + v, 0)
  return Object.entries(sectors).map(([name, value]) => ({
    name,
    value,
    pct: (value / total) * 100,
  })).sort((a, b) => b.value - a.value)
}

// Allocation by venue
function getVenueAllocation() {
  const venues: Record<string, number> = {}
  MOCK_HOLDINGS.forEach((h) => {
    venues[h.venue] = (venues[h.venue] || 0) + h.balance * h.price
  })
  const total = Object.values(venues).reduce((s, v) => s + v, 0)
  return Object.entries(venues).map(([name, value]) => ({
    name: name as VenueName,
    value,
    pct: (value / total) * 100,
  })).sort((a, b) => b.value - a.value)
}

const SECTOR_COLORS: Record<string, string> = {
  'Technology': '#3b82f6',
  'Index': '#8b5cf6',
  'Fixed Income': '#06b6d4',
  'Automotive': '#f59e0b',
  'Finance': '#10b981',
}

const VENUE_COLORS: Record<string, string> = {
  xstocks: '#3b82f6',
  ondo: '#8b5cf6',
  securitize: '#06b6d4',
}

export default function DashboardPage() {
  const { connected } = useWallet()

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Wallet className="h-10 w-10 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium text-foreground mb-1">Connect Wallet</h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Connect your Solana wallet to view your tokenized stock portfolio
        </p>
        <WalletMultiButton style={{
          backgroundColor: 'var(--primary)',
          height: '40px',
          fontSize: '14px',
          borderRadius: '8px',
          fontFamily: 'inherit',
        }} />
      </div>
    )
  }

  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.balance * h.price, 0)
  const totalPnl = MOCK_HOLDINGS.reduce((s, h) => s + h.balance * h.price * (h.change / 100), 0)
  const totalPnlPct = (totalPnl / (totalValue - totalPnl)) * 100
  const isPnlUp = totalPnl >= 0
  const sectorAlloc = getAllocation()
  const venueAlloc = getVenueAllocation()

  // Top performers
  const sorted = [...MOCK_HOLDINGS].sort((a, b) => b.change - a.change)
  const topGainer = sorted[0]
  const topLoser = sorted[sorted.length - 1]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2 border border-border rounded-lg bg-card p-5">
          <p className="text-[12px] text-muted-foreground mb-1">Total Portfolio Value</p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-semibold text-foreground tabular-nums">
              {formatUSD(totalValue)}
            </h1>
            <span className={cn(
              'flex items-center gap-0.5 text-[13px] font-medium',
              isPnlUp ? 'text-success' : 'text-destructive'
            )}>
              {isPnlUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {formatUSD(Math.abs(totalPnl))} ({formatPercent(totalPnlPct)})
              <span className="text-muted-foreground font-normal ml-1">24h</span>
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4 text-[12px]">
            <div>
              <span className="text-muted-foreground">Assets</span>
              <span className="ml-1.5 text-foreground font-medium">{MOCK_HOLDINGS.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Venues</span>
              <span className="ml-1.5 text-foreground font-medium">{new Set(MOCK_HOLDINGS.map(h => h.venue)).size}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Chain</span>
              <span className="ml-1.5 text-foreground font-medium">Solana</span>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg bg-card p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <p className="text-[12px] text-muted-foreground">Top Gainer</p>
          </div>
          <p className="text-[15px] font-medium text-foreground">{topGainer.name}</p>
          <p className="text-[12px] text-muted-foreground">{topGainer.ticker}</p>
          <p className="text-[13px] font-medium text-success mt-2 tabular-nums">
            {formatPercent(topGainer.change)}
          </p>
        </div>

        <div className="border border-border rounded-lg bg-card p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
            <p className="text-[12px] text-muted-foreground">Top Loser</p>
          </div>
          <p className="text-[15px] font-medium text-foreground">{topLoser.name}</p>
          <p className="text-[12px] text-muted-foreground">{topLoser.ticker}</p>
          <p className={cn("text-[13px] font-medium mt-2 tabular-nums", topLoser.change >= 0 ? 'text-success' : 'text-destructive')}>
            {formatPercent(topLoser.change)}
          </p>
        </div>
      </div>

      {/* Allocation Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sector Allocation */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-[13px] font-medium text-foreground">Sector Allocation</h2>
          </div>
          <div className="p-5 space-y-3">
            {sectorAlloc.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: SECTOR_COLORS[s.name] || '#6b7280' }} />
                    <span className="text-foreground">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground tabular-nums">{formatUSD(s.value)}</span>
                    <span className="text-foreground font-medium tabular-nums w-12 text-right">{s.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${s.pct}%`, backgroundColor: SECTOR_COLORS[s.name] || '#6b7280' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Allocation */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-[13px] font-medium text-foreground">Venue Allocation</h2>
          </div>
          <div className="p-5 space-y-3">
            {venueAlloc.map((v) => (
              <div key={v.name}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: VENUE_COLORS[v.name] || '#6b7280' }} />
                    <span className="text-foreground">{VENUE_META[v.name]?.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground tabular-nums">{formatUSD(v.value)}</span>
                    <span className="text-foreground font-medium tabular-nums w-12 text-right">{v.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${v.pct}%`, backgroundColor: VENUE_COLORS[v.name] || '#6b7280' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-foreground">Holdings</h2>
          <span className="text-[11px] text-muted-foreground">Solana</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-5 py-2.5 font-medium">Asset</th>
              <th className="text-left px-5 py-2.5 font-medium">Venue</th>
              <th className="text-left px-5 py-2.5 font-medium">Token</th>
              <th className="text-right px-5 py-2.5 font-medium">Price</th>
              <th className="text-right px-5 py-2.5 font-medium">24h</th>
              <th className="text-right px-5 py-2.5 font-medium">Balance</th>
              <th className="text-right px-5 py-2.5 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_HOLDINGS.map((h) => {
              const value = h.balance * h.price
              const isUp = h.change >= 0
              return (
                <tr key={h.ticker + h.venue} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={'/trade/' + h.ticker} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-foreground">
                        {h.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{h.name}</p>
                        <p className="text-[11px] text-muted-foreground">{h.ticker}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-foreground">
                    {VENUE_META[h.venue]?.label}
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-muted-foreground font-mono">
                    {h.tokenSymbol}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-foreground tabular-nums">
                    {formatUSD(h.price)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={cn('text-[13px] tabular-nums font-medium', isUp ? 'text-success' : 'text-destructive')}>
                      {formatPercent(h.change)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-foreground tabular-nums">
                    {h.balance.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] font-medium text-foreground tabular-nums">
                    {formatUSD(value)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">About tokenized stocks:</span>{' '}
          Holdings are tokenized representations of underlying securities on Solana, issued by third-party venues
          (xStocks, Ondo Finance, Securitize). Each token is backed 1:1 by the underlying asset held by the
          issuing venue. OnChain Broker does not custody any assets. This is not financial advice.
        </p>
      </div>
    </div>
  )
}
