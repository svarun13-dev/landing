'use client'

import { Check, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { formatUSD, formatCompactUSD, cn } from '@/lib/utils'
import { CHAIN_NAMES, CHAIN_COLORS } from '@/config/chains'

interface Venue {
  name: string
  chainId: number
  price: number
  fees: number
  liquidity: number
}

interface VenueComparisonProps {
  underlying: string
  venues: Venue[]
  isLoading?: boolean
}

export function VenueComparison({
  underlying,
  venues,
  isLoading,
}: VenueComparisonProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Venue Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                </div>
                <div className="skeleton h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (venues.length === 0) {
    return null
  }

  // Sort by effective price (price + fees)
  const sortedVenues = [...venues].sort(
    (a, b) => a.price * (1 + a.fees) - b.price * (1 + b.fees)
  )
  const bestVenue = sortedVenues[0]
  const worstVenue = sortedVenues[sortedVenues.length - 1]
  const spread =
    ((worstVenue.price - bestVenue.price) / bestVenue.price) * 100

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Venue Comparison</CardTitle>
        {spread > 0 && (
          <Badge variant="secondary">
            {spread.toFixed(3)}% spread
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedVenues.map((venue, index) => {
            const isBest = index === 0
            const chainColor = CHAIN_COLORS[venue.chainId] || '#6366f1'
            const priceDiff = ((venue.price - bestVenue.price) / bestVenue.price) * 100

            return (
              <div
                key={`${venue.name}-${venue.chainId}`}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-4 transition-colors',
                  isBest
                    ? 'border-success bg-success/5'
                    : 'border-border hover:bg-secondary/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${chainColor}20` }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: chainColor }}
                    >
                      {venue.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground capitalize">
                        {venue.name}
                      </span>
                      {isBest && (
                        <Badge variant="success" className="gap-1">
                          <Zap className="h-3 w-3" />
                          Best
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs"
                        style={{ color: chainColor }}
                      >
                        {CHAIN_NAMES[venue.chainId]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Fee: {(venue.fees * 100).toFixed(2)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Liq: {formatCompactUSD(venue.liquidity)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-foreground tabular-nums">
                    {formatUSD(venue.price)}
                  </p>
                  {!isBest && priceDiff > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +{priceDiff.toFixed(3)}%
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Arbitrage Opportunity */}
        {spread > 0.1 && (
          <div className="mt-4 rounded-lg border border-primary/50 bg-primary/5 p-3">
            <p className="text-sm font-medium text-primary">
              Arbitrage Opportunity Detected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {spread.toFixed(3)}% price difference between {bestVenue.name} and{' '}
              {worstVenue.name}. Buy on {bestVenue.name}, sell on {worstVenue.name}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
