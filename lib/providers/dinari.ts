import type { PriceData, Provider, ProviderQuote, QuoteParams } from './types'

// Dinari dShares - tokenized stocks on Arbitrum

const DINARI_TOKENS: Record<string, {
  name: string
  underlying: string
  mockPrice: number
}> = {
  dAAPL: {
    name: 'Dinari Apple',
    underlying: 'AAPL',
    mockPrice: 178.72,
  },
  dGOOGL: {
    name: 'Dinari Alphabet',
    underlying: 'GOOGL',
    mockPrice: 153.51,
  },
  dTSLA: {
    name: 'Dinari Tesla',
    underlying: 'TSLA',
    mockPrice: 177.48,
  },
  dAMZN: {
    name: 'Dinari Amazon',
    underlying: 'AMZN',
    mockPrice: 178.25,
  },
  dMSFT: {
    name: 'Dinari Microsoft',
    underlying: 'MSFT',
    mockPrice: 415.50,
  },
  dMETA: {
    name: 'Dinari Meta',
    underlying: 'META',
    mockPrice: 505.75,
  },
  dNVDA: {
    name: 'Dinari NVIDIA',
    underlying: 'NVDA',
    mockPrice: 875.38,
  },
  dNFLX: {
    name: 'Dinari Netflix',
    underlying: 'NFLX',
    mockPrice: 628.50,
  },
  dDIS: {
    name: 'Dinari Disney',
    underlying: 'DIS',
    mockPrice: 112.30,
  },
  dSPY: {
    name: 'Dinari SPDR S&P 500',
    underlying: 'SPY',
    mockPrice: 515.25,
  },
}

export class DinariProvider implements Provider {
  name = 'dinari'

  private generateRealisticPrice(basePrice: number): {
    price: number
    change24h: number
    high24h: number
    low24h: number
  } {
    const variation = (Math.random() - 0.5) * 0.015 // ±0.75%
    const price = basePrice * (1 + variation)
    const change24h = (Math.random() - 0.5) * 5 // ±2.5%

    return {
      price,
      change24h,
      high24h: price * (1 + Math.abs(change24h) / 100 + 0.003),
      low24h: price * (1 - Math.abs(change24h) / 100 - 0.003),
    }
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    const token = DINARI_TOKENS[symbol]
    if (!token) return null

    const { price, change24h, high24h, low24h } = this.generateRealisticPrice(
      token.mockPrice
    )

    return {
      symbol,
      price,
      change24h,
      volume24h: 500_000 + Math.random() * 300_000,
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

    // Dinari has a flat fee structure
    const mintFee = 0.0035 // 0.35%
    const outputAmount = inputAmount * price.price * (1 - mintFee)

    return {
      provider: this.name,
      chainId: 42161, // Arbitrum
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      outputAmount: outputAmount.toString(),
      price: price.price,
      priceImpact: 0, // No price impact for mint/redeem
      fees: {
        gas: '0.0005', // Arbitrum is cheap
        protocol: (inputAmount * mintFee).toString(),
        total: (inputAmount * mintFee + 0.0005).toString(),
      },
      route: ['mint'],
      estimatedGas: '300000',
      validUntil: Date.now() + 60000,
    }
  }

  // Get available dShares
  getAvailableTokens(): string[] {
    return Object.keys(DINARI_TOKENS)
  }

  // Check KYC status (Dinari requires KYC)
  async checkKYCStatus(address: string): Promise<{
    verified: boolean
    level: 'none' | 'basic' | 'full'
  }> {
    // Mock KYC check
    return {
      verified: true,
      level: 'full',
    }
  }

  // Get mint limits based on KYC level
  getMintLimits(kycLevel: 'none' | 'basic' | 'full'): {
    daily: number
    monthly: number
  } {
    const limits = {
      none: { daily: 0, monthly: 0 },
      basic: { daily: 10_000, monthly: 50_000 },
      full: { daily: 100_000, monthly: 1_000_000 },
    }
    return limits[kycLevel]
  }
}

export const dinariProvider = new DinariProvider()
