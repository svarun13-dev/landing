'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react'
import { formatUSD, cn } from '@/lib/utils'
import { ASSETS, VENUE_META, type Asset } from '@/config/assets'

const MOCK_PRICES: Record<string, { price: number; change: number; volume: number }> = {
  AAPL:  { price: 178.72, change: 2.14, volume: 58200000 },
  NVDA:  { price: 875.38, change: 4.21, volume: 42100000 },
  TSLA:  { price: 177.48, change: -1.23, volume: 91500000 },
  MSFT:  { price: 420.55, change: 1.35, volume: 22300000 },
  AMZN:  { price: 178.25, change: 0.82, volume: 35700000 },
  GOOGL: { price: 155.72, change: 1.67, volume: 24500000 },
  META:  { price: 505.15, change: 3.45, volume: 18900000 },
  COIN:  { price: 225.30, change: -2.15, volume: 12400000 },
  SPY:   { price: 523.45, change: 0.87, volume: 72000000 },
  OUSG:  { price: 104.52, change: 0.02, volume: 5200000 },
  USDY:  { price: 1.06,   change: 0.01, volume: 3100000 },
}

type Filter = 'all' | 'stock' | 'etf' | 'treasury'

export default function MarketsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    return ASSETS.filter((a) => {
      const q = search.toLowerCase()
      const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.ticker.toLowerCase().includes(q)
      const matchesFilter = filter === 'all' || a.type === filter
      return matchesSearch && matchesFilter
    })
  }, [search, filter])

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Stocks', value: 'stock' },
    { label: 'ETFs', value: 'etf' },
    { label: 'Treasuries', value: 'treasury' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-foreground">Markets</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-56 rounded-md border border-border bg-background pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors',
              filter === f.value
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-5 py-2.5 font-medium">Asset</th>
              <th className="text-right px-5 py-2.5 font-medium">Price</th>
              <th className="text-right px-5 py-2.5 font-medium">24h</th>
              <th className="text-right px-5 py-2.5 font-medium">Volume</th>
              <th className="text-left px-5 py-2.5 font-medium">Venues</th>
              <th className="text-right px-5 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => {
              const p = MOCK_PRICES[asset.ticker] || { price: 0, change: 0, volume: 0 }
              const isUp = p.change >= 0
              return (
                <tr key={asset.id} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={'/trade/' + asset.ticker} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-foreground">
                        {asset.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-foreground">{asset.name}</p>
                        <p className="text-[11px] text-muted-foreground">{asset.ticker} &middot; {asset.sector}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[13px] text-foreground tabular-nums">
                    {formatUSD(p.price)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className={cn('inline-flex items-center gap-0.5 text-[13px] tabular-nums font-medium', isUp ? 'text-success' : 'text-destructive')}>
                      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(p.change).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[12px] text-muted-foreground tabular-nums">
                    ${(p.volume / 1e6).toFixed(1)}M
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {asset.venues.map((v) => (
                        <span
                          key={v.name}
                          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-accent text-muted-foreground"
                        >
                          {VENUE_META[v.name]?.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={'/trade/' + asset.ticker}
                      className="inline-flex items-center rounded-md border border-border px-3 py-1 text-[12px] font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <p className="text-[13px] text-muted-foreground">No assets found</p>
          </div>
        )}
      </div>
    </div>
  )
}
