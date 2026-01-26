export interface PriceData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdated: number
  source: string
}

export interface ProviderQuote {
  provider: string
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  outputAmount: string
  price: number
  priceImpact: number
  fees: {
    gas: string
    protocol: string
    total: string
  }
  route?: string[]
  estimatedGas: string
  validUntil: number
}

export interface TokenBalance {
  token: string
  symbol: string
  name: string
  balance: string
  balanceUSD: number
  chainId: number
  decimals: number
  logo?: string
}

export interface PerpPosition {
  id: string
  symbol: string
  side: 'long' | 'short'
  size: number
  entryPrice: number
  markPrice: number
  liquidationPrice: number
  margin: number
  leverage: number
  unrealizedPnl: number
  unrealizedPnlPercent: number
  fundingRate: number
  timestamp: number
}

export interface OrderBook {
  bids: [number, number][] // [price, size]
  asks: [number, number][]
  timestamp: number
}

export interface Provider {
  name: string
  getPrice(symbol: string): Promise<PriceData | null>
  getPrices(symbols: string[]): Promise<Map<string, PriceData>>
  getQuote?(params: QuoteParams): Promise<ProviderQuote | null>
}

export interface QuoteParams {
  inputToken: string
  outputToken: string
  inputAmount: string
  slippage: number
  userAddress?: string
}

export interface PerpProvider extends Provider {
  getPositions(address: string): Promise<PerpPosition[]>
  getOrderBook(symbol: string): Promise<OrderBook>
  openPosition(params: OpenPositionParams): Promise<string>
  closePosition(positionId: string): Promise<string>
  modifyPosition(positionId: string, params: ModifyPositionParams): Promise<string>
}

export interface OpenPositionParams {
  symbol: string
  side: 'long' | 'short'
  size: number
  leverage: number
  price?: number // limit price, undefined for market
  stopLoss?: number
  takeProfit?: number
}

export interface ModifyPositionParams {
  size?: number
  stopLoss?: number
  takeProfit?: number
}
