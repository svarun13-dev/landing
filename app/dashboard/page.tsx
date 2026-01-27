'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Link from 'next/link'
import { formatUSD, formatPercent, cn } from '@/lib/utils'
import { CHAIN_NAMES, CHAIN_COLORS } from '@/config/chains'
import { VENUE_META, type VenueName } from '@/config/assets'

const MOCK_HOLDINGS = [
  { ticker: 'AAPL', name: 'Apple', venue: 'dinari' as VenueName, chain: 42161, balance: 12.5, price: 178.72, change: 2.14 },
  { ticker: 'NVDA', name: 'NVIDIA', venue: 'backed' as VenueName, chain: 8453, balance: 5.0, price: 875.38, change: 4.21 },
  { ticker: 'SPY', name: 'S&P 500 ETF', venue: 'backed' as VenueName, chain: 8453, balance: 15.0, price: 523.45, change: 0.87 },
  { ticker: 'TSLA', name: 'Tesla', venue: 'xstocks' as VenueName, chain: 900, balance: 8.0, price: 177.48, change: -1.23 },
  { ticker: 'OUSG', name: 'US Gov Bond Fund', venue: 'ondo' as VenueName, chain: 1, balance: 100.0, price: 104.52, change: 0.02 },
  { ticker: 'MSFT', name: 'Microsoft', venue: 'dinari' as VenueName, chain: 42161, balance: 3.0, price: 420.55, change: 1.35 },
]

export default function DashboardPage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Wallet className="h-10 w-10 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium text-foreground mb-1">Connect Wallet</h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          Connect your wallet to view your tokenized stock portfolio
        </p>
        <ConnectButton />
      </div>
    )
  }

  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.balance * h.price, 0)
  const totalPnl = MOCK_HOLDINGS.reduce(
    (s, h) => s + h.balance * h.price * (h.change / 100), 0
  )
  const totalPnlPct = (totalPnl / (totalValue - totalPnl)) * 100
  const isPnlUp = totalPnl >= 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-[13px] text-muted-foreground mb-1">Total Portfolio Value</p>
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
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-[13px] font-medium text-foreground">Holdings</h2>
        </div>
        <table>
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="text-left px-5 py-2.5 font-medium">Asset</th>
              <th className="text-left px-5 py-2.5 font-medium">Venue / Chain</th>
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
                  <td className="px-5 py-3.5">
                    <p className="text-[12px] text-foreground">{VENUE_META[h.venue]?.label}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS[h.chain] }} />
                      {CHAIN_NAMES[h.chain]}
                    </p>
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

      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">About tokenized stocks:</span>{' '}
          Holdings shown are tokenized representations of underlying securities issued by third-party venues
          (Dinari, Backed Finance, Ondo, xStocks). Each token is backed 1:1 by the underlying asset held by the
          issuing venue. OnChain Broker does not custody any assets. This is not financial advice.
        </p>
      </div>
    </div>
  )
}
