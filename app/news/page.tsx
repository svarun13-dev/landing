'use client'

import { ExternalLink, Clock } from 'lucide-react'

const MOCK_NEWS = [
  {
    id: 1,
    title: 'Ondo Finance Expands Tokenized Treasury Offerings on Solana',
    summary: 'Ondo Finance announces new tokenized US Treasury products available on Solana, providing institutional-grade fixed income exposure on-chain.',
    source: 'The Block',
    category: 'Tokenization',
    time: '2h ago',
  },
  {
    id: 2,
    title: 'SEC Provides Updated Guidance on Tokenized Securities',
    summary: 'The SEC has released new guidance on the classification and trading of tokenized real-world assets, bringing more regulatory clarity to the space.',
    source: 'CoinDesk',
    category: 'Regulation',
    time: '4h ago',
  },
  {
    id: 3,
    title: 'xStocks Adds 50 New Tokenized Equities to Solana Marketplace',
    summary: 'xStocks expands its offering with 50 new tokenized stocks including major S&P 500 companies, all available for 24/7 trading on Solana.',
    source: 'Decrypt',
    category: 'Platform',
    time: '6h ago',
  },
  {
    id: 4,
    title: 'Apple Reports Record Q4 Earnings, Stock Surges 5%',
    summary: 'Apple Inc. reports quarterly revenue of $124.3B, surpassing analyst expectations. The earnings beat drives both traditional and tokenized stock prices higher.',
    source: 'Bloomberg',
    category: 'Earnings',
    time: '8h ago',
  },
  {
    id: 5,
    title: 'Securitize Partners with Major Asset Manager for On-Chain Distribution',
    summary: 'Securitize announces a strategic partnership to tokenize and distribute traditional investment products through blockchain infrastructure.',
    source: 'Reuters',
    category: 'Partnerships',
    time: '12h ago',
  },
  {
    id: 6,
    title: 'Solana TVL Reaches New All-Time High on RWA Growth',
    summary: 'Solana total value locked surges past $15B, driven largely by growth in tokenized real-world assets and institutional adoption.',
    source: 'DeFi Llama',
    category: 'DeFi',
    time: '14h ago',
  },
  {
    id: 7,
    title: 'NVIDIA Stock Hits New Highs Amid AI Chip Demand',
    summary: 'NVIDIA shares reach record levels as demand for AI training chips continues to accelerate. Tokenized NVDA trading volume spikes across venues.',
    source: 'CNBC',
    category: 'Markets',
    time: '16h ago',
  },
  {
    id: 8,
    title: 'Gold Prices Rise as Investors Seek Safe-Haven Assets',
    summary: 'Gold futures climb 2.3% amid geopolitical uncertainty, increasing interest in tokenized commodity products on-chain.',
    source: 'Financial Times',
    category: 'Commodities',
    time: '1d ago',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Tokenization: 'bg-blue-500/10 text-blue-400',
  Regulation: 'bg-amber-500/10 text-amber-400',
  Platform: 'bg-purple-500/10 text-purple-400',
  Earnings: 'bg-green-500/10 text-green-400',
  Partnerships: 'bg-cyan-500/10 text-cyan-400',
  DeFi: 'bg-indigo-500/10 text-indigo-400',
  Markets: 'bg-emerald-500/10 text-emerald-400',
  Commodities: 'bg-orange-500/10 text-orange-400',
}

export default function NewsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">News</h1>
        <span className="text-[11px] text-muted-foreground">Tokenized stocks, commodities & DeFi</span>
      </div>

      <div className="space-y-3">
        {MOCK_NEWS.map((item) => (
          <article
            key={item.id}
            className="border border-border rounded-lg bg-card p-5 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category] || 'bg-accent text-muted-foreground'}`}>
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
                <h2 className="text-[14px] font-medium text-foreground mb-1.5 leading-snug">
                  {item.title}
                </h2>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {item.summary}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {item.source}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card px-5 py-4 text-center">
        <p className="text-[11px] text-muted-foreground">
          News feed is a placeholder. Live feeds from aggregated sources coming soon.
        </p>
      </div>
    </div>
  )
}
