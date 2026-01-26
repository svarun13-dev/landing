'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Star,
  StarOff,
  Filter,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { Input } from '@/components/ui'
import { formatUSD, formatCompactUSD, cn } from '@/lib/utils'
import { useAggregatedPrices } from '@/lib/hooks'
import { usePreferencesStore } from '@/lib/store'
import { MiniChart } from '@/components/charts/MiniChart'
import { CHAIN_NAMES, CHAIN_COLORS } from '@/config/chains'
import { ALL_ASSETS } from '@/config/assets'

export default function MarketsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const { prices, isLoading } = useAggregatedPrices()
  const { favoriteAssets, addFavorite, removeFavorite } = usePreferencesStore()

  // Filter and search
  const filteredAssets = prices.filter((asset) => {
    const matchesSearch =
      search === '' ||
      asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
      asset.underlying.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'all' ||
      (category === 'stocks' && !asset.symbol.includes('PERP')) ||
      (category === 'perps' && asset.symbol.includes('PERP')) ||
      (category === 'treasury' &&
        (asset.symbol.includes('IB') ||
          asset.symbol.includes('USG') ||
          asset.symbol.includes('USDY'))) ||
      (category === 'favorites' && favoriteAssets.includes(asset.symbol))

    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (symbol: string) => {
    if (favoriteAssets.includes(symbol)) {
      removeFavorite(symbol)
    } else {
      addFavorite(symbol)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Markets</h2>
          <p className="text-muted-foreground mt-1">
            Browse tokenized stocks and perpetuals across all venues
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onChange={setCategory}>
        <TabsList>
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="perps">Perpetuals</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="mr-1 h-4 w-4" />
            Favorites
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Markets Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium" />
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Venues</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">24h Change</th>
                <th className="px-4 py-3 font-medium text-right">Volume</th>
                <th className="px-4 py-3 font-medium text-right">Chart</th>
                <th className="px-4 py-3 font-medium text-right">Spread</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-4">
                        <div className="skeleton h-5 w-5" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="skeleton h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <div className="skeleton h-4 w-20" />
                            <div className="skeleton h-3 w-32" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="skeleton h-5 w-16" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="skeleton h-4 w-20 ml-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="skeleton h-4 w-16 ml-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="skeleton h-4 w-20 ml-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="skeleton h-8 w-20 ml-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="skeleton h-4 w-12 ml-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="skeleton h-8 w-16" />
                      </td>
                    </tr>
                  ))
                : filteredAssets.map((asset) => {
                    const bestPrice = asset.bestPrice
                    const price = asset.prices[0]
                    if (!price) return null

                    const isPositive = price.change24h >= 0
                    const isFavorite = favoriteAssets.includes(asset.symbol)

                    return (
                      <tr
                        key={asset.symbol}
                        className="border-b border-border/50 transition-colors hover:bg-secondary/30 last:border-0"
                      >
                        {/* Favorite */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleFavorite(asset.symbol)}
                            className="text-muted-foreground transition-colors hover:text-warning"
                          >
                            {isFavorite ? (
                              <Star className="h-5 w-5 fill-warning text-warning" />
                            ) : (
                              <StarOff className="h-5 w-5" />
                            )}
                          </button>
                        </td>

                        {/* Asset */}
                        <td className="px-4 py-4">
                          <Link
                            href={`/trade/${asset.underlying}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                              <span className="text-sm font-bold text-foreground">
                                {asset.underlying.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {asset.underlying}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {asset.symbol}
                              </p>
                            </div>
                          </Link>
                        </td>

                        {/* Venues */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {asset.prices.map((p, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: CHAIN_COLORS[p.chainId],
                                }}
                              >
                                {p.provider}
                              </Badge>
                            ))}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-medium text-foreground tabular-nums">
                            {formatUSD(bestPrice.price)}
                          </span>
                        </td>

                        {/* 24h Change */}
                        <td className="px-4 py-4 text-right">
                          <div
                            className={cn(
                              'flex items-center justify-end gap-1 font-medium',
                              isPositive ? 'text-success' : 'text-destructive'
                            )}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                            {Math.abs(price.change24h).toFixed(2)}%
                          </div>
                        </td>

                        {/* Volume */}
                        <td className="px-4 py-4 text-right text-muted-foreground tabular-nums">
                          {formatCompactUSD(price.volume24h)}
                        </td>

                        {/* Chart */}
                        <td className="px-4 py-4">
                          <div className="flex justify-end">
                            <MiniChart isPositive={isPositive} />
                          </div>
                        </td>

                        {/* Spread */}
                        <td className="px-4 py-4 text-right">
                          {asset.spread > 0 ? (
                            <span className="text-sm text-muted-foreground tabular-nums">
                              {asset.spread.toFixed(3)}%
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </td>

                        {/* Trade */}
                        <td className="px-4 py-4">
                          <Link href={`/trade/${asset.underlying}`}>
                            <Button size="sm">Trade</Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No assets found</p>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setSearch('')}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
