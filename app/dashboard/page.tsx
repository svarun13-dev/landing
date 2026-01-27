'use client'

import { useState, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import {
  Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Download,
  ArrowRightLeft, Plus, LogOut, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { VENUE_META, type VenueName } from '@/config/assets'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
)

// ─── Data Model ──────────────────────────────────────────────

interface Holding {
  ticker: string
  name: string
  venue: VenueName
  tokenSymbol: string
  quantity: number
  avgEntryPrice: number
  lastPrice: number
  change24h: number
  realizedPnl: number
}

const MOCK_HOLDINGS: Holding[] = [
  { ticker: 'AAPL',  name: 'Apple',          venue: 'xstocks',    tokenSymbol: 'xAAPL',  quantity: 12.5,  avgEntryPrice: 165.20, lastPrice: 178.72, change24h: 2.14,  realizedPnl: 220.50 },
  { ticker: 'NVDA',  name: 'NVIDIA',         venue: 'securitize', tokenSymbol: 'sNVDA',  quantity: 5.0,   avgEntryPrice: 780.00, lastPrice: 875.38, change24h: 4.21,  realizedPnl: 0 },
  { ticker: 'SPY',   name: 'S&P 500 ETF',    venue: 'xstocks',    tokenSymbol: 'xSPY',   quantity: 15.0,  avgEntryPrice: 498.30, lastPrice: 523.45, change24h: 0.87,  realizedPnl: 145.00 },
  { ticker: 'TSLA',  name: 'Tesla',          venue: 'xstocks',    tokenSymbol: 'xTSLA',  quantity: 8.0,   avgEntryPrice: 192.15, lastPrice: 177.48, change24h: -1.23, realizedPnl: -82.30 },
  { ticker: 'OUSG',  name: 'US Gov Bond Fund', venue: 'ondo',     tokenSymbol: 'OUSG',   quantity: 100.0, avgEntryPrice: 103.80, lastPrice: 104.52, change24h: 0.02,  realizedPnl: 52.00 },
  { ticker: 'MSFT',  name: 'Microsoft',      venue: 'securitize', tokenSymbol: 'sMSFT',  quantity: 3.0,   avgEntryPrice: 395.40, lastPrice: 420.55, change24h: 1.35,  realizedPnl: 0 },
]

// Mock transaction history
interface Transaction {
  id: string
  type: 'buy' | 'sell' | 'mint' | 'redeem'
  asset: string
  ticker: string
  venue: VenueName
  quantity: number
  price: number
  fee: number
  timestamp: Date
  txHash: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'buy',    asset: 'Apple',  ticker: 'AAPL', venue: 'xstocks',    quantity: 5.0,  price: 172.40, fee: 3.21, timestamp: new Date('2025-01-26T14:32:00'), txHash: '4vJ9...xK2m' },
  { id: '2', type: 'buy',    asset: 'NVIDIA', ticker: 'NVDA', venue: 'securitize', quantity: 2.0,  price: 868.50, fee: 8.69, timestamp: new Date('2025-01-25T10:15:00'), txHash: '7bR3...pQ8n' },
  { id: '3', type: 'sell',   asset: 'Apple',  ticker: 'AAPL', venue: 'xstocks',    quantity: 3.0,  price: 176.80, fee: 2.65, timestamp: new Date('2025-01-24T16:45:00'), txHash: '9mX1...wL5v' },
  { id: '4', type: 'buy',    asset: 'S&P 500 ETF', ticker: 'SPY', venue: 'xstocks', quantity: 10.0, price: 515.20, fee: 7.73, timestamp: new Date('2025-01-23T09:30:00'), txHash: '2kN8...rT4j' },
  { id: '5', type: 'mint',   asset: 'US Gov Bond Fund', ticker: 'OUSG', venue: 'ondo', quantity: 50.0, price: 103.90, fee: 0, timestamp: new Date('2025-01-22T11:20:00'), txHash: '6dP5...yH9a' },
  { id: '6', type: 'buy',    asset: 'Microsoft', ticker: 'MSFT', venue: 'securitize', quantity: 3.0, price: 395.40, fee: 5.93, timestamp: new Date('2025-01-21T13:55:00'), txHash: '3fW7...cE2q' },
  { id: '7', type: 'buy',    asset: 'Tesla',  ticker: 'TSLA', venue: 'xstocks',    quantity: 8.0,  price: 192.15, fee: 4.61, timestamp: new Date('2025-01-20T08:10:00'), txHash: '8aZ6...nB3k' },
  { id: '8', type: 'buy',    asset: 'Apple',  ticker: 'AAPL', venue: 'xstocks',    quantity: 7.5,  price: 162.30, fee: 3.04, timestamp: new Date('2025-01-19T15:40:00'), txHash: '1gY4...sM7d' },
  { id: '9', type: 'mint',   asset: 'US Gov Bond Fund', ticker: 'OUSG', venue: 'ondo', quantity: 50.0, price: 103.70, fee: 0, timestamp: new Date('2025-01-18T12:00:00'), txHash: '5hU2...fA6p' },
  { id: '10', type: 'buy',   asset: 'S&P 500 ETF', ticker: 'SPY', venue: 'xstocks', quantity: 5.0,  price: 505.60, fee: 3.79, timestamp: new Date('2025-01-17T10:25:00'), txHash: '0iV9...gR1w' },
]

// Mock portfolio snapshots for performance chart
const generateSnapshots = () => {
  const days = 90
  const base = 28000
  const points: { date: string; value: number }[] = []
  let val = base
  for (let i = days; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    val += (Math.random() - 0.42) * 300 // slight upward drift
    points.push({ date: d.toISOString().split('T')[0], value: Math.max(val, base * 0.85) })
  }
  return points
}

const PERFORMANCE_RANGES = ['24H', '7D', '30D', 'YTD', 'All'] as const
type PerfRange = typeof PERFORMANCE_RANGES[number]
const RANGE_DAYS: Record<PerfRange, number> = { '24H': 1, '7D': 7, '30D': 30, 'YTD': 60, 'All': 90 }

// ─── Component ───────────────────────────────────────────────

export default function DashboardPage() {
  const { connected } = useWallet()
  const [perfRange, setPerfRange] = useState<PerfRange>('30D')
  const [showAllTx, setShowAllTx] = useState(false)
  const [expandedTx, setExpandedTx] = useState<string | null>(null)

  const snapshots = useMemo(() => generateSnapshots(), [])

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

  // ─── PnL Calculations ─────────────────────────────────────
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.quantity * h.lastPrice, 0)
  const totalCost = MOCK_HOLDINGS.reduce((s, h) => s + h.quantity * h.avgEntryPrice, 0)
  const unrealizedPnl = totalValue - totalCost
  const unrealizedPct = (unrealizedPnl / totalCost) * 100
  const realizedPnl = MOCK_HOLDINGS.reduce((s, h) => s + h.realizedPnl, 0)
  const totalPnl = unrealizedPnl + realizedPnl
  const totalPnlPct = (totalPnl / totalCost) * 100

  const todayPnl = MOCK_HOLDINGS.reduce((s, h) => s + h.quantity * h.lastPrice * (h.change24h / 100), 0)
  const todayPnlPct = (todayPnl / (totalValue - todayPnl)) * 100

  // ─── Performance Chart Data ────────────────────────────────
  const rangeDays = RANGE_DAYS[perfRange]
  const rangeData = snapshots.slice(-rangeDays - 1)
  const rangeStart = rangeData[0]?.value || 0
  const rangeEnd = rangeData[rangeData.length - 1]?.value || 0
  const rangeReturn = rangeEnd - rangeStart
  const rangeReturnPct = rangeStart > 0 ? (rangeReturn / rangeStart) * 100 : 0
  const rangeUp = rangeReturn >= 0

  // SVG sparkline
  const chartW = 800
  const chartH = 120
  const minV = Math.min(...rangeData.map((d) => d.value))
  const maxV = Math.max(...rangeData.map((d) => d.value))
  const rangeV = maxV - minV || 1
  const points = rangeData.map((d, i) => {
    const x = (i / (rangeData.length - 1)) * chartW
    const y = chartH - ((d.value - minV) / rangeV) * (chartH - 10) - 5
    return `${x},${y}`
  }).join(' ')

  // ─── Allocations ───────────────────────────────────────────
  const sectorMap: Record<string, number> = {}
  const venueMap: Record<string, number> = {}
  MOCK_HOLDINGS.forEach((h) => {
    const sector = h.ticker === 'SPY' ? 'Index' : h.ticker === 'OUSG' ? 'Fixed Income' : 'Technology'
    sectorMap[sector] = (sectorMap[sector] || 0) + h.quantity * h.lastPrice
    venueMap[h.venue] = (venueMap[h.venue] || 0) + h.quantity * h.lastPrice
  })
  const mkAlloc = (map: Record<string, number>) => {
    const total = Object.values(map).reduce((s, v) => s + v, 0)
    return Object.entries(map).map(([name, value]) => ({ name, value, pct: (value / total) * 100 })).sort((a, b) => b.value - a.value)
  }
  const sectorAlloc = mkAlloc(sectorMap)
  const venueAlloc = mkAlloc(venueMap)

  // ─── Performers ────────────────────────────────────────────
  const sorted = [...MOCK_HOLDINGS].sort((a, b) => b.change24h - a.change24h)
  const topGainer = sorted[0]
  const topLoser = sorted[sorted.length - 1]

  // ─── Transactions ──────────────────────────────────────────
  const visibleTx = showAllTx ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.slice(0, 6)

  // CSV export
  const exportCSV = () => {
    const holdingsCSV = [
      'Asset,Ticker,Venue,Token,Quantity,AvgEntry,LastPrice,Value,UnrealizedPnL,RealizedPnL',
      ...MOCK_HOLDINGS.map((h) => {
        const val = h.quantity * h.lastPrice
        const uPnl = h.quantity * (h.lastPrice - h.avgEntryPrice)
        return `${h.name},${h.ticker},${h.venue},${h.tokenSymbol},${h.quantity},${h.avgEntryPrice},${h.lastPrice},${val.toFixed(2)},${uPnl.toFixed(2)},${h.realizedPnl.toFixed(2)}`
      }),
    ].join('\n')

    const txCSV = [
      '\n\nTransactions',
      'Date,Type,Asset,Ticker,Venue,Quantity,Price,Fee,TxHash',
      ...MOCK_TRANSACTIONS.map((t) =>
        `${t.timestamp.toISOString()},${t.type},${t.asset},${t.ticker},${t.venue},${t.quantity},${t.price},${t.fee},${t.txHash}`
      ),
    ].join('\n')

    const summary = [
      `\n\nPortfolio Summary`,
      `Total Value,${totalValue.toFixed(2)}`,
      `Total PnL,${totalPnl.toFixed(2)}`,
      `Unrealized PnL,${unrealizedPnl.toFixed(2)}`,
      `Realized PnL,${realizedPnl.toFixed(2)}`,
    ].join('\n')

    const blob = new Blob([holdingsCSV + txCSV + summary], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onchain-portfolio-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const SECTOR_COLORS: Record<string, string> = { Technology: '#3b82f6', Index: '#8b5cf6', 'Fixed Income': '#06b6d4', Automotive: '#f59e0b', Finance: '#10b981' }
  const VENUE_COLORS: Record<string, string> = { xstocks: '#3b82f6', ondo: '#8b5cf6', securitize: '#06b6d4' }
  const TX_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    buy: { label: 'Bought', color: 'text-success' },
    sell: { label: 'Sold', color: 'text-destructive' },
    mint: { label: 'Minted', color: 'text-primary' },
    redeem: { label: 'Redeemed', color: 'text-amber-400' },
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ─── Top Bar: Actions ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Portfolio</h1>
        <div className="flex items-center gap-2">
          <Link href="/trade" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-[12px] font-medium text-foreground hover:bg-accent transition-colors">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Trade
          </Link>
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-[12px] font-medium text-foreground hover:bg-accent transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Capital
          </button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-[12px] font-medium text-foreground hover:bg-accent transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Withdraw
          </button>
          <button onClick={exportCSV} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* ─── PnL Summary ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total PnL Card */}
        <div className="md:col-span-2 border border-border rounded-lg bg-card p-5">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Portfolio Value</p>
          <h2 className="text-3xl font-semibold text-foreground tabular-nums">{formatUSD(totalValue)}</h2>
          <div className="mt-3 grid grid-cols-3 gap-4 pt-3 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total PnL</p>
              <p className={cn('text-[14px] font-semibold tabular-nums mt-0.5', totalPnl >= 0 ? 'text-success' : 'text-destructive')}>
                {totalPnl >= 0 ? '+' : ''}{formatUSD(totalPnl)}
              </p>
              <p className={cn('text-[11px] tabular-nums', totalPnl >= 0 ? 'text-success/70' : 'text-destructive/70')}>
                {formatPercent(totalPnlPct)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unrealized</p>
              <p className={cn('text-[14px] font-semibold tabular-nums mt-0.5', unrealizedPnl >= 0 ? 'text-success' : 'text-destructive')}>
                {unrealizedPnl >= 0 ? '+' : ''}{formatUSD(unrealizedPnl)}
              </p>
              <p className={cn('text-[11px] tabular-nums', unrealizedPnl >= 0 ? 'text-success/70' : 'text-destructive/70')}>
                {formatPercent(unrealizedPct)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Realized</p>
              <p className={cn('text-[14px] font-semibold tabular-nums mt-0.5', realizedPnl >= 0 ? 'text-success' : 'text-destructive')}>
                {realizedPnl >= 0 ? '+' : ''}{formatUSD(realizedPnl)}
              </p>
            </div>
          </div>
        </div>

        {/* Today's PnL */}
        <div className="border border-border rounded-lg bg-card p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Today&apos;s PnL</p>
          <p className={cn('text-xl font-semibold tabular-nums', todayPnl >= 0 ? 'text-success' : 'text-destructive')}>
            {todayPnl >= 0 ? '+' : ''}{formatUSD(todayPnl)}
          </p>
          <p className={cn('text-[12px] tabular-nums', todayPnl >= 0 ? 'text-success/70' : 'text-destructive/70')}>
            {formatPercent(todayPnlPct)}
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-success" />
              <p className="text-[11px] text-muted-foreground">
                Best: <span className="text-foreground font-medium">{topGainer.ticker}</span> {formatPercent(topGainer.change24h)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <p className="text-[11px] text-muted-foreground">
                Worst: <span className="text-foreground font-medium">{topLoser.ticker}</span> {formatPercent(topLoser.change24h)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border border-border rounded-lg bg-card p-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Portfolio Info</p>
          <div className="space-y-2.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assets</span>
              <span className="text-foreground font-medium">{MOCK_HOLDINGS.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venues</span>
              <span className="text-foreground font-medium">{new Set(MOCK_HOLDINGS.map(h => h.venue)).size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chain</span>
              <span className="text-foreground font-medium">Solana</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost Basis</span>
              <span className="text-foreground font-medium tabular-nums">{formatUSD(totalCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Performance Chart ────────────────────────────── */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-[13px] font-medium text-foreground">Performance</h2>
            <div className="flex items-center gap-1">
              <span className={cn('text-[13px] font-semibold tabular-nums', rangeUp ? 'text-success' : 'text-destructive')}>
                {rangeUp ? '+' : ''}{formatUSD(rangeReturn)}
              </span>
              <span className={cn('text-[12px] tabular-nums', rangeUp ? 'text-success/70' : 'text-destructive/70')}>
                ({formatPercent(rangeReturnPct)})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {PERFORMANCE_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setPerfRange(r)}
                className={cn(
                  'px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                  perfRange === r ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[140px]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={rangeUp ? '#16a34a' : '#dc2626'} stopOpacity="0.15" />
                <stop offset="100%" stopColor={rangeUp ? '#16a34a' : '#dc2626'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,${chartH} ${points} ${chartW},${chartH}`}
              fill="url(#chartGrad)"
            />
            <polyline
              points={points}
              fill="none"
              stroke={rangeUp ? '#16a34a' : '#dc2626'}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{rangeData[0]?.date}</span>
            <span>{rangeData[rangeData.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* ─── Allocations ──────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
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
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: SECTOR_COLORS[s.name] || '#6b7280' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
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
                    <span className="text-foreground">{VENUE_META[v.name as VenueName]?.label || v.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground tabular-nums">{formatUSD(v.value)}</span>
                    <span className="text-foreground font-medium tabular-nums w-12 text-right">{v.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v.pct}%`, backgroundColor: VENUE_COLORS[v.name] || '#6b7280' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Holdings Table (with PnL columns) ────────────── */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-foreground">Holdings</h2>
          <span className="text-[11px] text-muted-foreground">{MOCK_HOLDINGS.length} positions · Solana</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-5 py-2.5 font-medium">Asset</th>
                <th className="text-left px-3 py-2.5 font-medium">Venue</th>
                <th className="text-right px-3 py-2.5 font-medium">Price</th>
                <th className="text-right px-3 py-2.5 font-medium">24h</th>
                <th className="text-right px-3 py-2.5 font-medium">Qty</th>
                <th className="text-right px-3 py-2.5 font-medium">Avg Entry</th>
                <th className="text-right px-3 py-2.5 font-medium">Value</th>
                <th className="text-right px-3 py-2.5 font-medium">Unrealized</th>
                <th className="text-right px-5 py-2.5 font-medium">Realized</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HOLDINGS.map((h) => {
                const value = h.quantity * h.lastPrice
                const uPnl = h.quantity * (h.lastPrice - h.avgEntryPrice)
                const uPnlPct = ((h.lastPrice - h.avgEntryPrice) / h.avgEntryPrice) * 100
                return (
                  <tr key={h.ticker + h.venue} className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={'/trade/' + h.ticker.toLowerCase()} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-foreground">
                          {h.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{h.name}</p>
                          <p className="text-[11px] text-muted-foreground">{h.ticker}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-foreground">{VENUE_META[h.venue]?.label}</td>
                    <td className="px-3 py-3 text-right text-[13px] text-foreground tabular-nums">{formatUSD(h.lastPrice)}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={cn('text-[12px] tabular-nums font-medium', h.change24h >= 0 ? 'text-success' : 'text-destructive')}>
                        {formatPercent(h.change24h)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-[13px] text-foreground tabular-nums">{h.quantity.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-[13px] text-muted-foreground tabular-nums">{formatUSD(h.avgEntryPrice)}</td>
                    <td className="px-3 py-3 text-right text-[13px] font-medium text-foreground tabular-nums">{formatUSD(value)}</td>
                    <td className="px-3 py-3 text-right">
                      <p className={cn('text-[12px] font-medium tabular-nums', uPnl >= 0 ? 'text-success' : 'text-destructive')}>
                        {uPnl >= 0 ? '+' : ''}{formatUSD(uPnl)}
                      </p>
                      <p className={cn('text-[10px] tabular-nums', uPnl >= 0 ? 'text-success/60' : 'text-destructive/60')}>
                        {formatPercent(uPnlPct)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={cn('text-[12px] tabular-nums', h.realizedPnl === 0 ? 'text-muted-foreground' : h.realizedPnl > 0 ? 'text-success' : 'text-destructive')}>
                        {h.realizedPnl === 0 ? '—' : `${h.realizedPnl > 0 ? '+' : ''}${formatUSD(h.realizedPnl)}`}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Activity / Transaction History ───────────────── */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-foreground">Recent Activity</h2>
          <span className="text-[11px] text-muted-foreground">{MOCK_TRANSACTIONS.length} transactions</span>
        </div>
        <div className="divide-y divide-border/50">
          {visibleTx.map((tx) => {
            const meta = TX_TYPE_LABELS[tx.type]
            const isExpanded = expandedTx === tx.id
            return (
              <div key={tx.id}>
                <button
                  onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-accent/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-bold uppercase',
                      tx.type === 'buy' || tx.type === 'mint' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    )}>
                      {tx.type === 'buy' ? 'B' : tx.type === 'sell' ? 'S' : tx.type === 'mint' ? 'M' : 'R'}
                    </div>
                    <div>
                      <p className="text-[13px] text-foreground">
                        <span className={cn('font-medium', meta.color)}>{meta.label}</span>{' '}
                        <span className="font-medium">{tx.ticker}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {tx.quantity} @ {formatUSD(tx.price)} · {VENUE_META[tx.venue]?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[13px] font-medium text-foreground tabular-nums">
                        {formatUSD(tx.quantity * tx.price)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {tx.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 ml-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <p className="text-muted-foreground">Fee</p>
                      <p className="text-foreground font-medium">{tx.fee === 0 ? 'None' : formatUSD(tx.fee)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Venue</p>
                      <p className="text-foreground font-medium">{VENUE_META[tx.venue]?.label}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="text-foreground font-medium">
                        {tx.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tx Hash</p>
                      <button className="text-primary font-medium inline-flex items-center gap-1 hover:underline">
                        {tx.txHash} <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {MOCK_TRANSACTIONS.length > 6 && (
          <div className="px-5 py-3 border-t border-border">
            <button
              onClick={() => setShowAllTx(!showAllTx)}
              className="text-[12px] text-primary hover:underline font-medium"
            >
              {showAllTx ? 'Show less' : `View all ${MOCK_TRANSACTIONS.length} transactions`}
            </button>
          </div>
        )}
      </div>

      {/* ─── Disclaimer ───────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">About tokenized stocks:</span>{' '}
          Holdings are tokenized representations of underlying securities on Solana, issued by third-party venues
          (xStocks, Ondo Finance, Securitize). Each token is backed 1:1 by the underlying asset held by the
          issuing venue. OnChain Broker does not custody any assets. PnL calculations use weighted average cost basis.
          Past performance does not indicate future results. This is not financial advice.
        </p>
      </div>
    </div>
  )
}
