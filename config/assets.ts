export type AssetType = 'stock' | 'etf' | 'treasury' | 'commodity' | 'forex'
export type AssetCategory = 'tokenized-spot' | 'perp'

export interface TokenizedAsset {
  id: string
  symbol: string
  name: string
  type: AssetType
  category: AssetCategory
  underlying: string
  logo?: string
  providers: AssetProvider[]
}

export interface AssetProvider {
  name: 'ondo' | 'backed' | 'dinari' | 'hyperliquid' | 'ostium'
  chainId: number
  address?: string
  poolAddress?: string
  pairId?: string
  decimals: number
  minTradeSize?: number
  fees?: {
    mint?: number
    redeem?: number
    swap?: number
  }
}

// Tokenized Stocks - Spot
export const TOKENIZED_ASSETS: TokenizedAsset[] = [
  // Ondo Finance (Ethereum)
  {
    id: 'ousg',
    symbol: 'OUSG',
    name: 'Ondo Short-Term US Government Bond Fund',
    type: 'treasury',
    category: 'tokenized-spot',
    underlying: 'US Treasury Bills',
    logo: '/assets/ousg.png',
    providers: [
      {
        name: 'ondo',
        chainId: 1,
        address: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
        decimals: 18,
        fees: { mint: 0, redeem: 0 },
      },
    ],
  },
  {
    id: 'usdy',
    symbol: 'USDY',
    name: 'Ondo US Dollar Yield',
    type: 'treasury',
    category: 'tokenized-spot',
    underlying: 'US Treasury Bills',
    logo: '/assets/usdy.png',
    providers: [
      {
        name: 'ondo',
        chainId: 1,
        address: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
        decimals: 18,
        fees: { mint: 0, redeem: 0 },
      },
    ],
  },

  // Backed Finance (Base)
  {
    id: 'bcspx',
    symbol: 'bCSPX',
    name: 'Backed CSPX Core S&P 500',
    type: 'etf',
    category: 'tokenized-spot',
    underlying: 'S&P 500 ETF',
    logo: '/assets/bcspx.png',
    providers: [
      {
        name: 'backed',
        chainId: 8453,
        address: '0x9E2D266d6C90f6C0D80a88159B15958f7135B8Af',
        decimals: 18,
        fees: { swap: 0.001 },
      },
    ],
  },
  {
    id: 'bnvda',
    symbol: 'bNVDA',
    name: 'Backed NVIDIA',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'NVDA',
    logo: '/assets/bnvda.png',
    providers: [
      {
        name: 'backed',
        chainId: 8453,
        address: '0x4b5e15a7b26c8E57B48aE2D80E8eb4bBe16c8dC7',
        decimals: 18,
        fees: { swap: 0.001 },
      },
    ],
  },
  {
    id: 'bcoin',
    symbol: 'bCOIN',
    name: 'Backed Coinbase',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'COIN',
    logo: '/assets/bcoin.png',
    providers: [
      {
        name: 'backed',
        chainId: 8453,
        address: '0x2BbE65C7d6eA4AE4e7E8E72f2E6b2D44BD4C1e5f',
        decimals: 18,
        fees: { swap: 0.001 },
      },
    ],
  },
  {
    id: 'bib01',
    symbol: 'bIB01',
    name: 'Backed IB01 $ Treasury Bond 0-1yr',
    type: 'treasury',
    category: 'tokenized-spot',
    underlying: 'US Treasury 0-1Y',
    logo: '/assets/bib01.png',
    providers: [
      {
        name: 'backed',
        chainId: 8453,
        address: '0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5',
        decimals: 18,
        fees: { swap: 0.001 },
      },
    ],
  },

  // Dinari (Arbitrum)
  {
    id: 'daapl',
    symbol: 'dAAPL',
    name: 'Dinari Apple',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'AAPL',
    logo: '/assets/daapl.png',
    providers: [
      {
        name: 'dinari',
        chainId: 42161,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        decimals: 18,
        fees: { mint: 0.0035, redeem: 0.0035 },
      },
    ],
  },
  {
    id: 'dgoogl',
    symbol: 'dGOOGL',
    name: 'Dinari Alphabet',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'GOOGL',
    logo: '/assets/dgoogl.png',
    providers: [
      {
        name: 'dinari',
        chainId: 42161,
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        decimals: 18,
        fees: { mint: 0.0035, redeem: 0.0035 },
      },
    ],
  },
  {
    id: 'dtsla',
    symbol: 'dTSLA',
    name: 'Dinari Tesla',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'TSLA',
    logo: '/assets/dtsla.png',
    providers: [
      {
        name: 'dinari',
        chainId: 42161,
        address: '0x567890abcdef1234567890abcdef1234567890ab',
        decimals: 18,
        fees: { mint: 0.0035, redeem: 0.0035 },
      },
    ],
  },
  {
    id: 'damzn',
    symbol: 'dAMZN',
    name: 'Dinari Amazon',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'AMZN',
    logo: '/assets/damzn.png',
    providers: [
      {
        name: 'dinari',
        chainId: 42161,
        address: '0xcdef1234567890abcdef1234567890abcdef1234',
        decimals: 18,
        fees: { mint: 0.0035, redeem: 0.0035 },
      },
    ],
  },
  {
    id: 'dmsft',
    symbol: 'dMSFT',
    name: 'Dinari Microsoft',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'MSFT',
    logo: '/assets/dmsft.png',
    providers: [
      {
        name: 'dinari',
        chainId: 42161,
        address: '0xef1234567890abcdef1234567890abcdef123456',
        decimals: 18,
        fees: { mint: 0.0035, redeem: 0.0035 },
      },
    ],
  },
  {
    id: 'dmeta',
    symbol: 'dMETA',
    name: 'Dinari Meta',
    type: 'stock',
    category: 'tokenized-spot',
    underlying: 'META',
    logo: '/assets/dmeta.png',
    providers: [
      {
        name: 'dinari',
        chainId: 42161,
        address: '0x234567890abcdef1234567890abcdef12345678ef',
        decimals: 18,
        fees: { mint: 0.0035, redeem: 0.0035 },
      },
    ],
  },
]

// Stock Perps (Hyperliquid)
export const PERP_ASSETS: TokenizedAsset[] = [
  {
    id: 'aapl-perp',
    symbol: 'AAPL-PERP',
    name: 'Apple Perpetual',
    type: 'stock',
    category: 'perp',
    underlying: 'AAPL',
    logo: '/assets/aapl.png',
    providers: [
      {
        name: 'hyperliquid',
        chainId: 998,
        pairId: 'AAPL',
        decimals: 6,
        minTradeSize: 1,
        fees: { swap: 0.0001 },
      },
    ],
  },
  {
    id: 'nvda-perp',
    symbol: 'NVDA-PERP',
    name: 'NVIDIA Perpetual',
    type: 'stock',
    category: 'perp',
    underlying: 'NVDA',
    logo: '/assets/nvda.png',
    providers: [
      {
        name: 'hyperliquid',
        chainId: 998,
        pairId: 'NVDA',
        decimals: 6,
        minTradeSize: 1,
        fees: { swap: 0.0001 },
      },
    ],
  },
  {
    id: 'tsla-perp',
    symbol: 'TSLA-PERP',
    name: 'Tesla Perpetual',
    type: 'stock',
    category: 'perp',
    underlying: 'TSLA',
    logo: '/assets/tsla.png',
    providers: [
      {
        name: 'hyperliquid',
        chainId: 998,
        pairId: 'TSLA',
        decimals: 6,
        minTradeSize: 1,
        fees: { swap: 0.0001 },
      },
    ],
  },
  {
    id: 'googl-perp',
    symbol: 'GOOGL-PERP',
    name: 'Alphabet Perpetual',
    type: 'stock',
    category: 'perp',
    underlying: 'GOOGL',
    logo: '/assets/googl.png',
    providers: [
      {
        name: 'hyperliquid',
        chainId: 998,
        pairId: 'GOOGL',
        decimals: 6,
        minTradeSize: 1,
        fees: { swap: 0.0001 },
      },
    ],
  },
  {
    id: 'amzn-perp',
    symbol: 'AMZN-PERP',
    name: 'Amazon Perpetual',
    type: 'stock',
    category: 'perp',
    underlying: 'AMZN',
    logo: '/assets/amzn.png',
    providers: [
      {
        name: 'hyperliquid',
        chainId: 998,
        pairId: 'AMZN',
        decimals: 6,
        minTradeSize: 1,
        fees: { swap: 0.0001 },
      },
    ],
  },
]

export const ALL_ASSETS = [...TOKENIZED_ASSETS, ...PERP_ASSETS]

export function getAssetById(id: string): TokenizedAsset | undefined {
  return ALL_ASSETS.find((asset) => asset.id === id)
}

export function getAssetsByUnderlying(underlying: string): TokenizedAsset[] {
  return ALL_ASSETS.filter(
    (asset) => asset.underlying.toLowerCase() === underlying.toLowerCase()
  )
}

export function getAssetsByChain(chainId: number): TokenizedAsset[] {
  return ALL_ASSETS.filter((asset) =>
    asset.providers.some((p) => p.chainId === chainId)
  )
}

export function getAssetsByProvider(
  provider: AssetProvider['name']
): TokenizedAsset[] {
  return ALL_ASSETS.filter((asset) =>
    asset.providers.some((p) => p.name === provider)
  )
}
