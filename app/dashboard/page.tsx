'use client'

import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary'
import { HoldingsTable } from '@/components/portfolio/HoldingsTable'
import { AllocationChart } from '@/components/portfolio/AllocationChart'
import { PositionsSummary } from '@/components/trading/PositionsSummary'
import { MarketOverview } from '@/components/trading/MarketOverview'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Portfolio Overview</h2>
        <p className="text-muted-foreground mt-1">
          Track your tokenized stock holdings and perp positions
        </p>
      </div>

      <PortfolioSummary />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HoldingsTable />
        </div>
        <div>
          <MarketOverview />
        </div>
      </div>

      <AllocationChart />

      <PositionsSummary />
    </div>
  )
}
