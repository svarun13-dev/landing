import type { PriceData, Provider, ProviderQuote, QuoteParams } from './types'

// Ondo Finance token prices are typically based on NAV (Net Asset Value)
// These are updated daily based on underlying asset values

const ONDO_TOKENS = {
  OUSG: {
    name: 'Ondo Short-Term US Government Bond Fund',
    basePrice: 104.52, // Approximate NAV
    yield: 0.0525, // ~5.25% APY
  },
  USDY: {
    name: 'Ondo US Dollar Yield',
    basePrice: 1.0523,
    yield: 0.0525,
  },
  OMMF: {
    name: 'Ondo Money Market Fund',
    basePrice: 1.0,
    yield: 0.05,
  },
}

export class OndoProvider implements Provider {
  name = 'ondo'

  // Calculate price based on yield accrual
  private calculatePrice(token: keyof typeof ONDO_TOKENS): number {
    const { basePrice, yield: apy } = ONDO_TOKENS[token]
    // Simple daily accrual simulation
    const dailyRate = apy / 365
    const daysSinceBase = Math.floor(
      (Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)
    )
    return basePrice * Math.pow(1 + dailyRate, daysSinceBase % 365)
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    const tokenKey = symbol as keyof typeof ONDO_TOKENS
    if (!ONDO_TOKENS[tokenKey]) return null

    const price = this.calculatePrice(tokenKey)
    const dailyYield = ONDO_TOKENS[tokenKey].yield / 365

    return {
      symbol,
      price,
      change24h: dailyYield * 100, // Daily yield as "change"
      volume24h: 5_000_000 + Math.random() * 2_000_000, // Mock volume
      high24h: price * 1.001,
      low24h: price * 0.999,
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
    // Ondo uses mint/redeem mechanism, not AMM swaps
    const price = await this.getPrice(params.inputToken)
    if (!price) return null

    const inputAmount = parseFloat(params.inputAmount)
    const outputAmount = inputAmount * price.price

    return {
      provider: this.name,
      chainId: 1, // Ethereum mainnet
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      outputAmount: outputAmount.toString(),
      price: price.price,
      priceImpact: 0, // No price impact for mint/redeem
      fees: {
        gas: '50000', // Approximate gas
        protocol: '0', // No protocol fee for mint/redeem
        total: '50000',
      },
      route: ['mint'],
      estimatedGas: '150000',
      validUntil: Date.now() + 60000, // 1 minute
    }
  }

  // Ondo-specific: Get current yield/APY
  async getYield(symbol: string): Promise<number | null> {
    const tokenKey = symbol as keyof typeof ONDO_TOKENS
    if (!ONDO_TOKENS[tokenKey]) return null
    return ONDO_TOKENS[tokenKey].yield
  }

  // Check if user is whitelisted (Ondo requires KYC for some products)
  async isWhitelisted(address: string, token: string): Promise<boolean> {
    // In production, this would check against Ondo's whitelist contract
    // For MVP, assume all users are whitelisted
    return true
  }
}

export const ondoProvider = new OndoProvider()
