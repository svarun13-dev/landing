import { providers, type PriceData, type ProviderQuote, type QuoteParams } from '../providers'
import { ALL_ASSETS } from '@/config/assets'

export interface AggregatedPrice {
  symbol: string
  underlying: string
  prices: {
    provider: string
    chainId: number
    price: number
    change24h: number
    volume24h: number
    lastUpdated: number
  }[]
  bestPrice: {
    provider: string
    chainId: number
    price: number
  }
  spread: number // Difference between highest and lowest price
  averagePrice: number
}

export interface Route {
  steps: RouteStep[]
  totalFees: number
  totalGas: string
  priceImpact: number
  estimatedOutput: number
  estimatedTime: number // seconds
}

export interface RouteStep {
  provider: string
  action: 'swap' | 'mint' | 'redeem' | 'bridge'
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  outputAmount: string
}

export class Aggregator {
  // Get aggregated price data for an asset across all providers
  async getAggregatedPrice(symbol: string): Promise<AggregatedPrice | null> {
    const asset = ALL_ASSETS.find(
      (a) => a.symbol === symbol || a.underlying === symbol
    )
    if (!asset) return null

    const pricePromises = asset.providers.map(async (p) => {
      const provider = providers[p.name as keyof typeof providers]
      if (!provider) return null

      const price = await provider.getPrice(symbol)
      if (!price) return null

      return {
        provider: p.name,
        chainId: p.chainId,
        price: price.price,
        change24h: price.change24h,
        volume24h: price.volume24h,
        lastUpdated: price.lastUpdated,
      }
    })

    const prices = (await Promise.all(pricePromises)).filter(
      (p): p is NonNullable<typeof p> => p !== null
    )

    if (prices.length === 0) return null

    // Calculate metrics
    const sortedByPrice = [...prices].sort((a, b) => a.price - b.price)
    const bestPrice = sortedByPrice[0]
    const worstPrice = sortedByPrice[sortedByPrice.length - 1]
    const spread =
      ((worstPrice.price - bestPrice.price) / bestPrice.price) * 100
    const averagePrice =
      prices.reduce((sum, p) => sum + p.price, 0) / prices.length

    return {
      symbol,
      underlying: asset.underlying,
      prices,
      bestPrice: {
        provider: bestPrice.provider,
        chainId: bestPrice.chainId,
        price: bestPrice.price,
      },
      spread,
      averagePrice,
    }
  }

  // Get all aggregated prices for display
  async getAllAggregatedPrices(): Promise<AggregatedPrice[]> {
    const uniqueUnderlyings = Array.from(new Set(ALL_ASSETS.map((a) => a.underlying)))
    const results = await Promise.all(
      uniqueUnderlyings.map((u) => this.getAggregatedPrice(u))
    )
    return results.filter((r): r is AggregatedPrice => r !== null)
  }

  // Find best execution route
  async findBestRoute(
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    userAddress?: string
  ): Promise<Route | null> {
    // Find which providers support these tokens
    const inputAsset = ALL_ASSETS.find(
      (a) => a.symbol === inputToken || a.underlying === inputToken
    )
    const outputAsset = ALL_ASSETS.find(
      (a) => a.symbol === outputToken || a.underlying === outputToken
    )

    if (!inputAsset && !outputAsset) return null

    const routes: Route[] = []

    // Strategy 1: Direct swap if same provider
    if (inputAsset && outputAsset) {
      const commonProviders = inputAsset.providers.filter((ip) =>
        outputAsset.providers.some(
          (op) => op.name === ip.name && op.chainId === ip.chainId
        )
      )

      for (const provider of commonProviders) {
        const quote = await this.getQuote(
          provider.name,
          inputToken,
          outputToken,
          inputAmount,
          userAddress
        )
        if (quote) {
          routes.push({
            steps: [
              {
                provider: provider.name,
                action: 'swap',
                chainId: provider.chainId,
                inputToken,
                outputToken,
                inputAmount,
                outputAmount: quote.outputAmount,
              },
            ],
            totalFees: parseFloat(quote.fees.total),
            totalGas: quote.estimatedGas,
            priceImpact: quote.priceImpact,
            estimatedOutput: parseFloat(quote.outputAmount),
            estimatedTime: 30, // seconds
          })
        }
      }
    }

    // Strategy 2: Mint/redeem through native protocol
    if (inputToken === 'USDC' && outputAsset) {
      for (const provider of outputAsset.providers) {
        const quote = await this.getQuote(
          provider.name,
          inputToken,
          outputToken,
          inputAmount,
          userAddress
        )
        if (quote) {
          routes.push({
            steps: [
              {
                provider: provider.name,
                action: 'mint',
                chainId: provider.chainId,
                inputToken,
                outputToken,
                inputAmount,
                outputAmount: quote.outputAmount,
              },
            ],
            totalFees: parseFloat(quote.fees.total),
            totalGas: quote.estimatedGas,
            priceImpact: quote.priceImpact,
            estimatedOutput: parseFloat(quote.outputAmount),
            estimatedTime: 60,
          })
        }
      }
    }

    // Sort by best output
    routes.sort((a, b) => b.estimatedOutput - a.estimatedOutput)

    return routes[0] || null
  }

  // Get quote from specific provider
  private async getQuote(
    providerName: string,
    inputToken: string,
    outputToken: string,
    inputAmount: string,
    userAddress?: string
  ): Promise<ProviderQuote | null> {
    const provider = providers[providerName as keyof typeof providers] as { getPrice: (symbol: string) => Promise<PriceData | null>; getQuote?: (params: QuoteParams) => Promise<ProviderQuote | null> }
    if (!provider || !provider.getQuote) return null

    try {
      return await provider.getQuote({
        inputToken,
        outputToken,
        inputAmount,
        slippage: 0.5, // 0.5%
        userAddress,
      })
    } catch {
      return null
    }
  }

  // Compare prices across venues
  async comparePrices(underlying: string): Promise<{
    venues: {
      name: string
      chainId: number
      price: number
      fees: number
      liquidity: number
    }[]
    bestVenue: string
    priceDifference: number
  }> {
    const assets = ALL_ASSETS.filter((a) => a.underlying === underlying)
    const venues: {
      name: string
      chainId: number
      price: number
      fees: number
      liquidity: number
    }[] = []

    for (const asset of assets) {
      for (const provider of asset.providers) {
        const p = providers[provider.name as keyof typeof providers]
        if (!p) continue

        const price = await p.getPrice(asset.symbol)
        if (!price) continue

        venues.push({
          name: provider.name,
          chainId: provider.chainId,
          price: price.price,
          fees: provider.fees?.swap || provider.fees?.mint || 0,
          liquidity: price.volume24h,
        })
      }
    }

    if (venues.length === 0) {
      return { venues: [], bestVenue: '', priceDifference: 0 }
    }

    // Sort by effective price (price + fees)
    venues.sort((a, b) => a.price * (1 + a.fees) - b.price * (1 + b.fees))

    const bestPrice = venues[0].price
    const worstPrice = venues[venues.length - 1].price
    const priceDifference = ((worstPrice - bestPrice) / bestPrice) * 100

    return {
      venues,
      bestVenue: venues[0].name,
      priceDifference,
    }
  }
}

export const aggregator = new Aggregator()
