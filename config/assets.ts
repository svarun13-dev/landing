export type VenueName = 'xstocks' | 'ondo' | 'securitize'
export type AssetType = 'stock' | 'etf' | 'treasury'

export interface Venue {
  name: VenueName
  tokenSymbol: string       // On-chain token symbol (e.g., "xAAPL")
  mintAddress?: string       // Solana SPL token mint
  decimals: number
  fees?: { swap?: number; mint?: number; redeem?: number }
}

export interface Asset {
  id: string
  ticker: string            // Real-world ticker: AAPL, NVDA
  name: string              // Human name: Apple, NVIDIA
  type: AssetType
  sector?: string
  description?: string
  venues: Venue[]
}

export const ASSETS: Asset[] = [
  // ─── Stocks ─────────────────────────────────────────────
  {
    id: 'aapl', ticker: 'AAPL', name: 'Apple', type: 'stock',
    sector: 'Technology', description: 'Consumer electronics, software & services',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xAAPL', decimals: 9, fees: { swap: 0.003 } },
      { name: 'securitize', tokenSymbol: 'sAAPL', decimals: 9, fees: { swap: 0.002 } },
    ],
  },
  {
    id: 'nvda', ticker: 'NVDA', name: 'NVIDIA', type: 'stock',
    sector: 'Technology', description: 'GPU & AI semiconductor company',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xNVDA', decimals: 9, fees: { swap: 0.003 } },
      { name: 'securitize', tokenSymbol: 'sNVDA', decimals: 9, fees: { swap: 0.002 } },
    ],
  },
  {
    id: 'tsla', ticker: 'TSLA', name: 'Tesla', type: 'stock',
    sector: 'Automotive', description: 'Electric vehicles & clean energy',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xTSLA', decimals: 9, fees: { swap: 0.003 } },
      { name: 'securitize', tokenSymbol: 'sTSLA', decimals: 9, fees: { swap: 0.002 } },
    ],
  },
  {
    id: 'msft', ticker: 'MSFT', name: 'Microsoft', type: 'stock',
    sector: 'Technology', description: 'Enterprise software, cloud & AI',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xMSFT', decimals: 9, fees: { swap: 0.003 } },
      { name: 'securitize', tokenSymbol: 'sMSFT', decimals: 9, fees: { swap: 0.002 } },
    ],
  },
  {
    id: 'amzn', ticker: 'AMZN', name: 'Amazon', type: 'stock',
    sector: 'Technology', description: 'E-commerce, cloud computing & AI',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xAMZN', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'googl', ticker: 'GOOGL', name: 'Alphabet', type: 'stock',
    sector: 'Technology', description: 'Search, advertising, cloud & AI',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xGOOGL', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'meta', ticker: 'META', name: 'Meta Platforms', type: 'stock',
    sector: 'Technology', description: 'Social media, VR & advertising',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xMETA', decimals: 9, fees: { swap: 0.003 } },
      { name: 'securitize', tokenSymbol: 'sMETA', decimals: 9, fees: { swap: 0.002 } },
    ],
  },
  {
    id: 'coin', ticker: 'COIN', name: 'Coinbase', type: 'stock',
    sector: 'Finance', description: 'Cryptocurrency exchange & infrastructure',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xCOIN', decimals: 9, fees: { swap: 0.003 } },
    ],
  },

  // ─── ETFs ───────────────────────────────────────────────
  {
    id: 'spy', ticker: 'SPY', name: 'S&P 500 ETF', type: 'etf',
    sector: 'Index', description: 'SPDR S&P 500 ETF Trust',
    venues: [
      { name: 'xstocks', tokenSymbol: 'xSPY', decimals: 9, fees: { swap: 0.003 } },
    ],
  },

  // ─── Treasuries ─────────────────────────────────────────
  {
    id: 'ousg', ticker: 'OUSG', name: 'US Gov Bond Fund', type: 'treasury',
    sector: 'Fixed Income', description: 'Ondo Short-Term US Government Bond Fund',
    venues: [
      { name: 'ondo', tokenSymbol: 'OUSG', decimals: 9, fees: { mint: 0, redeem: 0 } },
    ],
  },
  {
    id: 'usdy', ticker: 'USDY', name: 'US Dollar Yield', type: 'treasury',
    sector: 'Fixed Income', description: 'Ondo US Dollar Yield - tokenized note',
    venues: [
      { name: 'ondo', tokenSymbol: 'USDY', decimals: 9, fees: { mint: 0, redeem: 0 } },
    ],
  },
]

// ─── Venue metadata ──────────────────────────────────────

export const VENUE_META: Record<VenueName, { label: string; url: string; description: string }> = {
  xstocks:    { label: 'xStocks',     url: 'https://xstocks.io',    description: 'Tokenized equities on Solana' },
  ondo:       { label: 'Ondo Finance', url: 'https://ondo.finance',  description: 'Institutional-grade tokenized treasuries' },
  securitize: { label: 'Securitize',   url: 'https://securitize.io', description: 'SEC-registered digital asset securities' },
}

// ─── Helpers ─────────────────────────────────────────────

export function getAssetByTicker(ticker: string): Asset | undefined {
  return ASSETS.find((a) => a.ticker.toLowerCase() === ticker.toLowerCase())
}

export function getAssetsByType(type: AssetType): Asset[] {
  return ASSETS.filter((a) => a.type === type)
}

export function getAssetsByVenue(venue: VenueName): Asset[] {
  return ASSETS.filter((a) => a.venues.some((v) => v.name === venue))
}
