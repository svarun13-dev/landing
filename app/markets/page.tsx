'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowDownRight, Search, Wallet, ArrowUpDown } from 'lucide-react'
import { formatUSD, cn } from '@/lib/utils'
import { ASSETS, VENUE_META, type Asset, type AssetType, type VenueName } from '@/config/assets'

// ─── Mock data ──────────────────────────────────────────

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

// Mock held tickers (simulates portfolio bridge)
const HELD_TICKERS = new Set(['AAPL', 'NVDA', 'SPY', 'TSLA', 'OUSG', 'MSFT'])

type Filter = 'all' | 'stock' | 'etf' | 'treasury'
type SortKey = 'volume' | 'price' | 'change'
type SortDir = 'asc' | 'desc'

function getBestVenue(asset: Asset): VenueName {
  // Pick venue with lowest swap fee, fallback to first
  let best = asset.venues[0]
  for (const v of asset.venues) {
    if ((v.fees?.swap ?? Infinity) < (best.fees?.swap ?? Infinity)) {
      best = v
    }
  }
  return best.name
}

export default function MarketsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('volume')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const searchRef = useRef<HTMLInputElement>(null)

  // ⌘K / slash to focus search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const toggleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }, [sortKey])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let results = ASSETS.filter((a) => {
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.ticker.toLowerCase().includes(q) ||
        (a.sector && a.sector.toLowerCase().includes(q)) ||
        a.type.toLowerCase().includes(q)
      const matchesFilter = filter === 'all' || a.type === filter
      return matchesSearch && matchesFilter
    })

    results.sort((a, b) => {
      const pa = MOCK_PRICES[a.ticker] || { price: 0, change: 0, volume: 0 }
      const pb = MOCK_PRICES[b.ticker] || { price: 0, change: 0, volume: 0 }
      const mul = sortDir === 'desc' ? -1 : 1
      if (sortKey === 'volume') return mul * (pa.volume - pb.volume)
      if (sortKey === 'price') return mul * (pa.price - pb.price)
      return mul * (pa.change - pb.change)
    })

    return results
  }, [search, filter, sortKey, sortDir])

  // Group assets by type for visual separation
  const grouped = useMemo(() => {
    if (filter !== 'all') return [{ type: filter, assets: filtered }]
    const typeOrder: AssetType[] = ['stock', 'etf', 'treasury']
    const groups: { type: AssetType; assets: Asset[] }[] = []
    for (const t of typeOrder) {
      const items = filtered.filter((a) => a.type === t)
      if (items.length > 0) groups.push({ type: t, assets: items })
    }
    return groups
  }, [filtered, filter])

  const typeLabels: Record<AssetType, string> = {
    stock: 'Stocks',
    etf: 'ETFs',
    treasury: 'Fixed Income',
  }

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Stocks', value: 'stock' },
    { label: 'ETFs', value: 'etf' },
    { label: 'Treasuries', value: 'treasury' },
  ]

  function SortHeader({ label, sortKeyName, className }: { label: string; sortKeyName: SortKey; className?: string }) {
    const active = sortKey === sortKeyName
    return (
      <th
        className={cn('px-5 py-2.5 font-medium cursor-pointer select-none hover:text-foreground transition-colors', className)}
        onClick={() => toggleSort(sortKeyName)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (
            <ArrowUpDown className="h-2.5 w-2.5 text-foreground" />
          )}
        </span>
      </th>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-foreground">Markets</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search name, ticker, sector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-64 rounded-md border border-border bg-background pl-9 pr-8 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-muted-foreground/50 font-mono">/</kbd>
        </div>
      </div>

      {/* Filter tabs */}
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

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-5 py-2.5 font-medium">Asset</th>
              <SortHeader label="Price" sortKeyName="price" className="text-right" />
              <SortHeader label="24h" sortKeyName="change" className="text-right" />
              <SortHeader label="Volume" sortKeyName="volume" className="text-right" />
              <th className="text-left px-5 py-2.5 font-medium">Venues</th>
              <th className="text-right px-5 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((group, gi) => (
              <>
                {/* Section header when showing all */}
                {filter === 'all' && (
                  <tr key={'section-' + group.type}>
                    <td colSpan={6} className={cn('px-5 py-2 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium bg-background/50', gi > 0 && 'border-t border-border/30')}>
                      {typeLabels[group.type]}
                    </td>
                  </tr>
                )}
                {group.assets.map((asset) => {
                  const p = MOCK_PRICES[asset.ticker] || { price: 0, change: 0, volume: 0 }
                  const isUp = p.change >= 0
                  const held = HELD_TICKERS.has(asset.ticker)
                  const bestVenue = getBestVenue(asset)
                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors cursor-pointer group"
                      onClick={() => router.push('/trade/' + asset.ticker)}
                    >
                      {/* Asset */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-foreground">
                            {asset.ticker.slice(0, 2)}
                            {held && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary" title="In your portfolio">
                                <Wallet className="h-1.5 w-1.5 text-white" />
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-foreground">{asset.name}</p>
                            <p className="text-[11px] text-muted-foreground">{asset.ticker} &middot; {asset.sector}</p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 text-right text-[13px] text-foreground tabular-nums font-medium">
                        {formatUSD(p.price)}
                      </td>

                      {/* 24h change */}
                      <td className="px-5 py-3.5 text-right">
                        <span className={cn('inline-flex items-center gap-0.5 text-[13px] tabular-nums font-medium', isUp ? 'text-success' : 'text-destructive')}>
                          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(p.change).toFixed(2)}%
                        </span>
                      </td>

                      {/* Volume (de-emphasized) */}
                      <td className="px-5 py-3.5 text-right text-[11px] text-muted-foreground/70 tabular-nums">
                        ${(p.volume / 1e6).toFixed(1)}M
                      </td>

                      {/* Venues (de-emphasized, best venue highlighted) */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {asset.venues.map((v) => {
                            const isBest = v.name === bestVenue && asset.venues.length > 1
                            return (
                              <span
                                key={v.name}
                                className={cn(
                                  'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
                                  isBest
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-accent text-muted-foreground/60'
                                )}
                                title={isBest ? 'Best execution based on price + fees' : VENUE_META[v.name]?.description}
                              >
                                {VENUE_META[v.name]?.label}
                                {isBest && <span className="ml-1 text-[9px] opacity-70">&middot; Best</span>}
                              </span>
                            )
                          })}
                        </div>
                      </td>

                      {/* Trade CTA */}
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={'/trade/' + asset.ticker}
                          onClick={(e) => e.stopPropagation()}
                          className="relative inline-flex items-center rounded-md border border-border px-3 py-1 text-[12px] font-medium text-foreground hover:bg-accent transition-colors group/trade"
                        >
                          Trade
                          {/* Hover tooltip: best venue hint */}
                          <span className="pointer-events-none absolute bottom-full right-0 mb-1.5 hidden group-hover/trade:block whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] text-background font-normal shadow-lg">
                            Best via {VENUE_META[bestVenue]?.label} @ {formatUSD(p.price)}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2">
            <p className="text-[13px] text-muted-foreground">No assets found</p>
            <p className="text-[11px] text-muted-foreground/60">
              Try searching by name, ticker, or sector — e.g. &quot;technology&quot; or &quot;ETF&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
