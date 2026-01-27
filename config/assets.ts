export type VenueName = 'ondo' | 'backed' | 'dinari' | 'xstocks' | 'swarm' | 'securitize'
export type AssetType = 'stock' | 'etf' | 'treasury' | 'commodity'

export interface Venue {
  name: VenueName
  chainId: number
  tokenSymbol: string
  address?: string
  decimals: number
  fees?: { mint?: number; redeem?: number; swap?: number }
}

export interface Asset {
  id: string
  ticker: string
  name: string
  type: AssetType
  sector?: string
  description?: string
  venues: Venue[]
}

export const ASSETS: Asset[] = [
  // ─── Stocks ────────────────────────────────────────────
  {
    id: 'aapl', ticker: 'AAPL', name: 'Apple', type: 'stock',
    sector: 'Technology', description: 'Consumer electronics, software & services',
    venues: [
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dAAPL', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xAAPL', decimals: 9, fees: { swap: 0.003 } },
      { name: 'backed', chainId: 8453, tokenSymbol: 'bAAPL', decimals: 18, fees: { swap: 0.001 } },
    ],
  },
  {
    id: 'nvda', ticker: 'NVDA', name: 'NVIDIA', type: 'stock',
    sector: 'Technology', description: 'GPU & AI semiconductor company',
    venues: [
      { name: 'backed', chainId: 8453, tokenSymbol: 'bNVDA', address: '0x4b5e15a7b26c8E57B48aE2D80E8eb4bBe16c8dC7', decimals: 18, fees: { swap: 0.001 } },
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dNVDA', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xNVDA', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'tsla', ticker: 'TSLA', name: 'Tesla', type: 'stock',
    sector: 'Automotive', description: 'Electric vehicles & clean energy',
    venues: [
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dTSLA', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xTSLA', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'msft', ticker: 'MSFT', name: 'Microsoft', type: 'stock',
    sector: 'Technology', description: 'Enterprise software, cloud & AI',
    venues: [
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dMSFT', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xMSFT', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'amzn', ticker: 'AMZN', name: 'Amazon', type: 'stock',
    sector: 'Technology', description: 'E-commerce, cloud computing & AI',
    venues: [
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dAMZN', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xAMZN', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'googl', ticker: 'GOOGL', name: 'Alphabet', type: 'stock',
    sector: 'Technology', description: 'Search, advertising, cloud & AI',
    venues: [
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dGOOGL', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xGOOGL', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'meta', ticker: 'META', name: 'Meta Platforms', type: 'stock',
    sector: 'Technology', description: 'Social media, VR & advertising',
    venues: [
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dMETA', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xMETA', decimals: 9, fees: { swap: 0.003 } },
    ],
  },
  {
    id: 'coin', ticker: 'COIN', name: 'Coinbase', type: 'stock',
    sector: 'Finance', description: 'Cryptocurrency exchange & infrastructure',
    venues: [
      { name: 'backed', chainId: 8453, tokenSymbol: 'bCOIN', address: '0x2BbE65C7d6eA4AE4e7E8E72f2E6b2D44BD4C1e5f', decimals: 18, fees: { swap: 0.001 } },
      { name: 'dinari', chainId: 42161, tokenSymbol: 'dCOIN', decimals: 18, fees: { mint: 0.0035, redeem: 0.0035 } },
    ],
  },

  // ─── ETFs ──────────────────────────────────────────────
  {
    id: 'spy', ticker: 'SPY', name: 'S&P 500 ETF', type: 'etf',
    sector: 'Index', description: 'SPDR S&P 500 ETF Trust',
    venues: [
      { name: 'backed', chainId: 8453, tokenSymbol: 'bCSPX', address: '0x9E2D266d6C90f6C0D80a88159B15958f7135B8Af', decimals: 18, fees: { swap: 0.001 } },
      { name: 'xstocks', chainId: 900, tokenSymbol: 'xSPY', decimals: 9, fees: { swap: 0.003 } },
    ],
  },

  // ─── Treasuries ────────────────────────────────────────
  {
    id: 'ousg', ticker: 'OUSG', name: 'US Gov Bond Fund', type: 'treasury',
    sector: 'Fixed Income', description: 'Ondo Short-Term US Government Bond Fund',
    venues: [
      { name: 'ondo', chainId: 1, tokenSymbol: 'OUSG', address: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92', decimals: 18, fees: { mint: 0, redeem: 0 } },
    ],
  },
  {
    id: 'usdy', ticker: 'USDY', name: 'US Dollar Yield', type: 'treasury',
    sector: 'Fixed Income', description: 'Ondo US Dollar Yield - tokenized note',
    venues: [
      { name: 'ondo', chainId: 1, tokenSymbol: 'USDY', address: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C', decimals: 18, fees: { mint: 0, redeem: 0 } },
    ],
  },
  {
    id: 'bib01', ticker: 'BIB01', name: 'Treasury Bond 0-1Y', type: 'treasury',
    sector: 'Fixed Income', description: 'Backed IB01 $ Treasury Bond 0-1yr ETF',
    venues: [
      { name: 'backed', chainId: 8453, tokenSymbol: 'bIB01', address: '0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5', decimals: 18, fees: { swap: 0.001 } },
    ],
  },
]

// ─── Venue metadata ──────────────────────────────────────

export const VENUE_META: Record<VenueName, { label: string; url: string; description: string }> = {
  ondo:       { label: 'Ondo Finance',   url: 'https://ondo.finance',   description: 'Institutional-grade tokenized securities on Ethereum' },
  backed:     { label: 'Backed Finance', url: 'https://backed.fi',      description: 'Tokenized securities backed 1:1 on Base' },
  dinari:     { label: 'Dinari',         url: 'https://dinari.com',     description: 'SEC-compliant tokenized equities on Arbitrum' },
  xstocks:    { label: 'xStocks',        url: 'https://xstocks.io',    description: 'Tokenized equities on Solana' },
  swarm:      { label: 'Swarm Markets',  url: 'https://swarm.com',     description: 'Regulated DeFi for tokenized securities' },
  securitize: { label: 'Securitize',     url: 'https://securitize.io', description: 'Compliant digital asset securities' },
}

// ─── Helpers ─────────────────────────────────────────────

export function getAssetById(id: string): Asset | undefined {
  return ASSETS.find((a) => a.id === id)
}

export function getAssetByTicker(ticker: string): Asset | undefined {
  return ASSETS.find((a) => a.ticker.toLowerCase() === ticker.toLowerCase())
}

export function getAssetsByType(type: AssetType): Asset[] {
  return ASSETS.filter((a) => a.type === type)
}

export function getAssetsByVenue(venue: VenueName): Asset[] {
  return ASSETS.filter((a) => a.venues.some((v) => v.name === venue))
}

export function getAssetsByChain(chainId: number): Asset[] {
  return ASSETS.filter((a) => a.venues.some((v) => v.chainId === chainId))
}

// Backward compat for aggregator
export const ALL_ASSETS = ASSETS.map((a) => ({
  id: a.id,
  symbol: a.ticker,
  name: a.name,
  type: a.type,
  category: 'tokenized-spot' as const,
  underlying: a.ticker,
  providers: a.venues.map((v) => ({
    name: v.name,
    chainId: v.chainId,
    address: v.address,
    decimals: v.decimals,
    fees: v.fees,
  })),
}))

export function getAssetsByUnderlying(underlying: string) {
  return ALL_ASSETS.filter(
    (a) => a.underlying.toLowerCase() === underlying.toLowerCase()
  )
}
