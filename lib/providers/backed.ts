import type { PriceData, Provider, ProviderQuote, QuoteParams } from './types'

// Backed Finance tokenized securities
// Prices track underlying securities 1:1 (minus small tracking error)

const BACKED_TOKENS: Record<string, {
  name: string
  underlying: string
  type: 'stock' | 'etf' | 'bond'
  mockPrice: number
}> = {
  bCSPX: {
    name: 'Backed CSPX Core S&P 500',
    underlying: 'CSPX',
    type: 'etf',
    mockPrice: 523.45,
  },
  bNVDA: {
    name: 'Backed NVIDIA',
    underlying: 'NVDA',
    type: 'stock',
    mockPrice: 875.38,
  },
  bCOIN: {
    name: 'Backed Coinbase',
    underlying: 'COIN',
    type: 'stock',
    mockPrice: 225.30,
  },
  bIB01: {
    name: 'Backed IB01 $ Treasury Bond 0-1yr',
    underlying: 'IB01',
    type: 'bond',
    mockPrice: 108.23,
  },
  bGOVT: {
    name: 'Backed iShares US Treasury Bond ETF',
    underlying: 'GOVT',
    type: 'etf',
    mockPrice: 21.85,
  },
  bMSTR: {
    name: 'Backed MicroStrategy',
    underlying: 'MSTR',
    type: 'stock',
    mockPrice: 1650.00,
  },
}

export class BackedProvider implements Provider {
  name = 'backed'

  private generateRealisticPrice(basePrice: number): {
    price: number
    change24h: number
    high24h: number
    low24h: number
  } {
    // Add small random variation to simulate market movement
    const variation = (Math.random() - 0.5) * 0.02 // ±1%
    const price = basePrice * (1 + variation)
    const change24h = (Math.random() - 0.5) * 4 // ±2%

    return {
      price,
      change24h,
      high24h: price * (1 + Math.abs(change24h) / 100 + 0.005),
      low24h: price * (1 - Math.abs(change24h) / 100 - 0.005),
    }
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    const token = BACKED_TOKENS[symbol]
    if (!token) return null

    const { price, change24h, high24h, low24h } = this.generateRealisticPrice(
      token.mockPrice
    )

    return {
      symbol,
      price,
      change24h,
      volume24h: 1_000_000 + Math.random() * 500_000,
      high24h,
      low24h,
      lastUpdated: Date.now(),
      source: this.name,
    }
  }

  async getPrices(symbols: string[]): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>()

    for (const symbol of symbols) {
      const price = await this.getPrice(symbol)
      if (price) {
        prices.set(symbol, price)
      }
    }

    return prices
  }

  async getQuote(params: QuoteParams): Promise<ProviderQuote | null> {
    const price = await this.getPrice(params.inputToken)
    if (!price) return null

    const inputAmount = parseFloat(params.inputAmount)
    // Backed uses Balancer pools, so there's some price impact
    const priceImpact = inputAmount > 10000 ? 0.003 : 0.001

    return {
      provider: this.name,
      chainId: 8453, // Base
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      outputAmount: (inputAmount * price.price * (1 - priceImpact)).toString(),
      price: price.price,
      priceImpact: priceImpact * 100,
      fees: {
        gas: '0.001', // Base is cheap
        protocol: (inputAmount * 0.001).toString(), // 0.1% swap fee
        total: (inputAmount * 0.001 + 0.001).toString(),
      },
      route: ['Balancer'],
      estimatedGas: '200000',
      validUntil: Date.now() + 30000,
    }
  }

  // Get Balancer pool liquidity
  async getPoolLiquidity(symbol: string): Promise<number> {
    // Mock liquidity data
    const liquidityMap: Record<string, number> = {
      bCSPX: 5_000_000,
      bNVDA: 2_500_000,
      bCOIN: 1_500_000,
      bIB01: 8_000_000,
      bGOVT: 3_000_000,
      bMSTR: 1_000_000,
    }
    return liquidityMap[symbol] || 0
  }

  // Check market hours (Backed tokens only trade during market hours)
  isMarketOpen(): boolean {
    const now = new Date()
    const nyTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/New_York' })
    )
    const hours = nyTime.getHours()
    const day = nyTime.getDay()

    // Market open Mon-Fri 9:30 AM - 4:00 PM ET
    if (day === 0 || day === 6) return false
    if (hours < 9 || hours >= 16) return false
    if (hours === 9 && nyTime.getMinutes() < 30) return false

    return true
  }
}

export const backedProvider = new BackedProvider()
