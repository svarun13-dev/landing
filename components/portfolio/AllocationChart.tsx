'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { usePortfolioAllocation } from '@/lib/hooks'
import { formatUSD } from '@/lib/utils'
import { CHAIN_NAMES, CHAIN_COLORS } from '@/config/chains'

const ASSET_COLORS = [
  '#6366f1', // Indigo
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#14b8a6', // Teal
]

export function AllocationChart() {
  const { byAsset, byChain } = usePortfolioAllocation()

  const assetData = byAsset.map((item, index) => ({
    name: item.symbol,
    value: item.value,
    color: ASSET_COLORS[index % ASSET_COLORS.length],
  }))

  const chainData = byChain.map((item) => ({
    name: CHAIN_NAMES[item.chainId] || 'Unknown',
    value: item.value,
    color: CHAIN_COLORS[item.chainId] || '#6366f1',
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatUSD(data.value)}</p>
        </div>
      )
    }
    return null
  }

  if (assetData.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* By Asset */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {assetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {assetData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By Chain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chainData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {chainData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
