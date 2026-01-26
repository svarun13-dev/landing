export * from './types'
export * from './coingecko'
export * from './hyperliquid'
export * from './ondo'
export * from './backed'
export * from './dinari'

import { coingeckoProvider } from './coingecko'
import { hyperliquidProvider } from './hyperliquid'
import { ondoProvider } from './ondo'
import { backedProvider } from './backed'
import { dinariProvider } from './dinari'
import type { PriceData, Provider } from './types'

// Provider registry
export const providers = {
  coingecko: coingeckoProvider,
  hyperliquid: hyperliquidProvider,
  ondo: ondoProvider,
  backed: backedProvider,
  dinari: dinariProvider,
} as const

export type ProviderName = keyof typeof providers

// Get all prices from all providers
export async function getAllPrices(
  symbols: string[]
): Promise<Map<string, PriceData>> {
  const allPrices = new Map<string, PriceData>()

  // Fetch from all providers in parallel
  const results = await Promise.all([
    coingeckoProvider.getPrices(symbols),
    ondoProvider.getPrices(symbols.filter((s) => s.startsWith('O') || s.startsWith('U'))),
    backedProvider.getPrices(symbols.filter((s) => s.startsWith('b'))),
    dinariProvider.getPrices(symbols.filter((s) => s.startsWith('d'))),
  ])

  // Merge results, preferring native provider prices over coingecko
  for (const priceMap of results) {
    Array.from(priceMap.entries()).forEach(([symbol, price]) => {
      // Prefer native provider prices
      if (!allPrices.has(symbol) || price.source !== 'coingecko') {
        allPrices.set(symbol, price)
      }
    })
  }

  return allPrices
}

// Get best price across providers for a specific asset
export async function getBestPrice(
  symbol: string
): Promise<{ price: PriceData; provider: string } | null> {
  const providerList: Provider[] = Object.values(providers)

  const results = await Promise.all(
    providerList.map(async (provider) => {
      const price = await provider.getPrice(symbol)
      return price ? { price, provider: provider.name } : null
    })
  )

  const validResults = results.filter((r): r is NonNullable<typeof r> => r !== null)

  if (validResults.length === 0) return null

  // Return the price from the native provider, or the most recent one
  validResults.sort((a, b) => {
    // Prefer native providers
    if (a.price.source !== 'coingecko' && b.price.source === 'coingecko') return -1
    if (a.price.source === 'coingecko' && b.price.source !== 'coingecko') return 1
    // Then by timestamp
    return b.price.lastUpdated - a.price.lastUpdated
  })

  return validResults[0]
}
