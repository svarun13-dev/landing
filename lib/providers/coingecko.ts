import type { PriceData, Provider } from './types'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY

// Map our symbols to CoinGecko IDs
const SYMBOL_TO_ID: Record<string, string> = {
  AAPL: 'apple', // Note: CoinGecko doesn't have stocks, using as placeholder
  NVDA: 'nvidia',
  TSLA: 'tesla',
  GOOGL: 'alphabet',
  AMZN: 'amazon',
  MSFT: 'microsoft',
  META: 'meta-platforms',
  COIN: 'coinbase',
  // Crypto tokens
  ETH: 'ethereum',
  BTC: 'bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
}

// For tokenized stocks, we'll use mock data since CoinGecko doesn't track them
const MOCK_STOCK_PRICES: Record<string, PriceData> = {
  AAPL: {
    symbol: 'AAPL',
    price: 178.72,
    change24h: 1.23,
    volume24h: 52_000_000,
    high24h: 180.10,
    low24h: 177.50,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  NVDA: {
    symbol: 'NVDA',
    price: 875.38,
    change24h: 2.45,
    volume24h: 38_000_000,
    high24h: 890.00,
    low24h: 860.25,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  TSLA: {
    symbol: 'TSLA',
    price: 177.48,
    change24h: -0.82,
    volume24h: 95_000_000,
    high24h: 182.00,
    low24h: 175.20,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  GOOGL: {
    symbol: 'GOOGL',
    price: 153.51,
    change24h: 0.67,
    volume24h: 22_000_000,
    high24h: 155.00,
    low24h: 152.10,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  AMZN: {
    symbol: 'AMZN',
    price: 178.25,
    change24h: 1.12,
    volume24h: 45_000_000,
    high24h: 180.50,
    low24h: 176.80,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  MSFT: {
    symbol: 'MSFT',
    price: 415.50,
    change24h: 0.89,
    volume24h: 18_000_000,
    high24h: 418.00,
    low24h: 412.30,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  META: {
    symbol: 'META',
    price: 505.75,
    change24h: 1.56,
    volume24h: 12_000_000,
    high24h: 510.00,
    low24h: 498.50,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  COIN: {
    symbol: 'COIN',
    price: 225.30,
    change24h: 3.21,
    volume24h: 8_000_000,
    high24h: 230.00,
    low24h: 218.75,
    lastUpdated: Date.now(),
    source: 'mock',
  },
  // Treasury/Bond products
  OUSG: {
    symbol: 'OUSG',
    price: 104.52,
    change24h: 0.01,
    volume24h: 5_000_000,
    high24h: 104.55,
    low24h: 104.50,
    lastUpdated: Date.now(),
    source: 'ondo',
  },
  USDY: {
    symbol: 'USDY',
    price: 1.0523,
    change24h: 0.002,
    volume24h: 10_000_000,
    high24h: 1.0525,
    low24h: 1.0520,
    lastUpdated: Date.now(),
    source: 'ondo',
  },
  bCSPX: {
    symbol: 'bCSPX',
    price: 523.45,
    change24h: 0.85,
    volume24h: 2_500_000,
    high24h: 525.00,
    low24h: 520.10,
    lastUpdated: Date.now(),
    source: 'backed',
  },
  bIB01: {
    symbol: 'bIB01',
    price: 108.23,
    change24h: 0.02,
    volume24h: 1_500_000,
    high24h: 108.25,
    low24h: 108.20,
    lastUpdated: Date.now(),
    source: 'backed',
  },
}

export class CoingeckoProvider implements Provider {
  name = 'coingecko'

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    const headers: Record<string, string> = {}
    if (API_KEY) {
      headers['x-cg-demo-api-key'] = API_KEY
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { headers })
        if (response.ok) return response
        if (response.status === 429) {
          // Rate limited, wait and retry
          await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
          continue
        }
        throw new Error(`HTTP ${response.status}`)
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)))
      }
    }
    throw new Error('Max retries exceeded')
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    // Check mock data first (for stocks)
    if (MOCK_STOCK_PRICES[symbol]) {
      return {
        ...MOCK_STOCK_PRICES[symbol],
        lastUpdated: Date.now(),
      }
    }

    const id = SYMBOL_TO_ID[symbol]
    if (!id) return null

    try {
      const response = await this.fetchWithRetry(
        `${COINGECKO_API}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      )
      const data = await response.json()
      const coinData = data[id]

      if (!coinData) return null

      return {
        symbol,
        price: coinData.usd,
        change24h: coinData.usd_24h_change || 0,
        volume24h: coinData.usd_24h_vol || 0,
        high24h: coinData.usd * 1.02, // Approximation
        low24h: coinData.usd * 0.98,
        lastUpdated: Date.now(),
        source: this.name,
      }
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error)
      return null
    }
  }

  async getPrices(symbols: string[]): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>()

    // First, add all mock stock prices
    for (const symbol of symbols) {
      if (MOCK_STOCK_PRICES[symbol]) {
        prices.set(symbol, {
          ...MOCK_STOCK_PRICES[symbol],
          lastUpdated: Date.now(),
        })
      }
    }

    // Then fetch any crypto prices from CoinGecko
    const cryptoSymbols = symbols.filter(
      (s) => SYMBOL_TO_ID[s] && !MOCK_STOCK_PRICES[s]
    )

    if (cryptoSymbols.length > 0) {
      const ids = cryptoSymbols.map((s) => SYMBOL_TO_ID[s]).join(',')

      try {
        const response = await this.fetchWithRetry(
          `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
        )
        const data = await response.json()

        for (const symbol of cryptoSymbols) {
          const id = SYMBOL_TO_ID[symbol]
          const coinData = data[id]

          if (coinData) {
            prices.set(symbol, {
              symbol,
              price: coinData.usd,
              change24h: coinData.usd_24h_change || 0,
              volume24h: coinData.usd_24h_vol || 0,
              high24h: coinData.usd * 1.02,
              low24h: coinData.usd * 0.98,
              lastUpdated: Date.now(),
              source: this.name,
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch crypto prices:', error)
      }
    }

    return prices
  }
}

export const coingeckoProvider = new CoingeckoProvider()
