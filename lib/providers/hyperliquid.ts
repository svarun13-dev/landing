import type {
  PriceData,
  PerpProvider,
  PerpPosition,
  OrderBook,
  OpenPositionParams,
  ModifyPositionParams,
  ProviderQuote,
  QuoteParams,
} from './types'

const HYPERLIQUID_API = process.env.NEXT_PUBLIC_HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz'

interface HyperliquidMeta {
  universe: Array<{
    name: string
    szDecimals: number
    maxLeverage: number
  }>
}

interface HyperliquidAssetCtx {
  funding: string
  openInterest: string
  prevDayPx: string
  dayNtlVlm: string
  premium: string
  oraclePx: string
  markPx: string
}

interface HyperliquidPosition {
  coin: string
  entryPx: string
  leverage: { type: string; value: number }
  liquidationPx: string
  marginUsed: string
  positionValue: string
  returnOnEquity: string
  szi: string
  unrealizedPnl: string
}

export class HyperliquidProvider implements PerpProvider {
  name = 'hyperliquid'
  private meta: HyperliquidMeta | null = null
  private wsConnection: WebSocket | null = null
  private priceSubscriptions: Map<string, ((price: PriceData) => void)[]> = new Map()

  private async fetchAPI<T>(endpoint: string, body?: object): Promise<T> {
    const response = await fetch(`${HYPERLIQUID_API}${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`)
    }

    return response.json()
  }

  private async getMeta(): Promise<HyperliquidMeta> {
    if (this.meta) return this.meta

    const response = await this.fetchAPI<[HyperliquidMeta, HyperliquidAssetCtx[]]>('/info', {
      type: 'meta',
    })

    this.meta = response[0]
    return this.meta
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      const response = await this.fetchAPI<[HyperliquidMeta, HyperliquidAssetCtx[]]>('/info', {
        type: 'metaAndAssetCtxs',
      })

      const [meta, assetCtxs] = response
      const index = meta.universe.findIndex((u) => u.name === symbol)

      if (index === -1) return null

      const ctx = assetCtxs[index]
      const markPrice = parseFloat(ctx.markPx)
      const prevDayPrice = parseFloat(ctx.prevDayPx)
      const change24h = ((markPrice - prevDayPrice) / prevDayPrice) * 100

      return {
        symbol,
        price: markPrice,
        change24h,
        volume24h: parseFloat(ctx.dayNtlVlm),
        high24h: markPrice * 1.05, // Approximation
        low24h: markPrice * 0.95,
        lastUpdated: Date.now(),
        source: this.name,
      }
    } catch (error) {
      console.error(`Failed to fetch Hyperliquid price for ${symbol}:`, error)
      return null
    }
  }

  async getPrices(symbols: string[]): Promise<Map<string, PriceData>> {
    const prices = new Map<string, PriceData>()

    try {
      const response = await this.fetchAPI<[HyperliquidMeta, HyperliquidAssetCtx[]]>('/info', {
        type: 'metaAndAssetCtxs',
      })

      const [meta, assetCtxs] = response

      for (const symbol of symbols) {
        const index = meta.universe.findIndex((u) => u.name === symbol)
        if (index === -1) continue

        const ctx = assetCtxs[index]
        const markPrice = parseFloat(ctx.markPx)
        const prevDayPrice = parseFloat(ctx.prevDayPx)
        const change24h = prevDayPrice > 0
          ? ((markPrice - prevDayPrice) / prevDayPrice) * 100
          : 0

        prices.set(symbol, {
          symbol,
          price: markPrice,
          change24h,
          volume24h: parseFloat(ctx.dayNtlVlm),
          high24h: markPrice * 1.05,
          low24h: markPrice * 0.95,
          lastUpdated: Date.now(),
          source: this.name,
        })
      }
    } catch (error) {
      console.error('Failed to fetch Hyperliquid prices:', error)
    }

    return prices
  }

  async getQuote(params: QuoteParams): Promise<ProviderQuote | null> {
    // Hyperliquid is a perp exchange, quotes work differently
    // This would be used for estimating execution price
    const price = await this.getPrice(params.inputToken)
    if (!price) return null

    return {
      provider: this.name,
      chainId: 998,
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      inputAmount: params.inputAmount,
      outputAmount: (parseFloat(params.inputAmount) * price.price).toString(),
      price: price.price,
      priceImpact: 0.01, // Minimal for liquid assets
      fees: {
        gas: '0',
        protocol: (parseFloat(params.inputAmount) * 0.0001).toString(), // 0.01% taker fee
        total: (parseFloat(params.inputAmount) * 0.0001).toString(),
      },
      estimatedGas: '0',
      validUntil: Date.now() + 10000, // 10 seconds
    }
  }

  async getPositions(address: string): Promise<PerpPosition[]> {
    try {
      const response = await this.fetchAPI<{
        assetPositions: Array<{ position: HyperliquidPosition }>
      }>('/info', {
        type: 'clearinghouseState',
        user: address,
      })

      return response.assetPositions
        .filter((ap) => parseFloat(ap.position.szi) !== 0)
        .map((ap) => {
          const pos = ap.position
          const size = parseFloat(pos.szi)
          const entryPrice = parseFloat(pos.entryPx)
          const markPrice = parseFloat(pos.positionValue) / Math.abs(size)
          const unrealizedPnl = parseFloat(pos.unrealizedPnl)

          return {
            id: `${pos.coin}-${address}`,
            symbol: pos.coin,
            side: size > 0 ? 'long' : 'short',
            size: Math.abs(size),
            entryPrice,
            markPrice,
            liquidationPrice: parseFloat(pos.liquidationPx),
            margin: parseFloat(pos.marginUsed),
            leverage: pos.leverage.value,
            unrealizedPnl,
            unrealizedPnlPercent: parseFloat(pos.returnOnEquity) * 100,
            fundingRate: 0, // Would need separate API call
            timestamp: Date.now(),
          } as PerpPosition
        })
    } catch (error) {
      console.error('Failed to fetch Hyperliquid positions:', error)
      return []
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    try {
      const response = await this.fetchAPI<{
        levels: [Array<{ px: string; sz: string; n: number }>, Array<{ px: string; sz: string; n: number }>]
      }>('/info', {
        type: 'l2Book',
        coin: symbol,
      })

      return {
        bids: response.levels[0].map((level) => [
          parseFloat(level.px),
          parseFloat(level.sz),
        ]),
        asks: response.levels[1].map((level) => [
          parseFloat(level.px),
          parseFloat(level.sz),
        ]),
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Failed to fetch order book:', error)
      return { bids: [], asks: [], timestamp: Date.now() }
    }
  }

  async openPosition(params: OpenPositionParams): Promise<string> {
    // In production, this would sign and submit an order
    // For MVP, we return a mock transaction hash
    console.log('Opening position:', params)
    return `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
  }

  async closePosition(positionId: string): Promise<string> {
    console.log('Closing position:', positionId)
    return `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
  }

  async modifyPosition(
    positionId: string,
    params: ModifyPositionParams
  ): Promise<string> {
    console.log('Modifying position:', positionId, params)
    return `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
  }

  // WebSocket subscription for real-time prices
  subscribeToPrice(symbol: string, callback: (price: PriceData) => void): () => void {
    if (!this.priceSubscriptions.has(symbol)) {
      this.priceSubscriptions.set(symbol, [])
    }
    this.priceSubscriptions.get(symbol)!.push(callback)

    // Initialize WebSocket if not connected
    this.initWebSocket()

    // Return unsubscribe function
    return () => {
      const callbacks = this.priceSubscriptions.get(symbol)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  private initWebSocket() {
    if (this.wsConnection) return

    try {
      this.wsConnection = new WebSocket('wss://api.hyperliquid.xyz/ws')

      this.wsConnection.onopen = () => {
        // Subscribe to all price feeds
        Array.from(this.priceSubscriptions.keys()).forEach((symbol) => {
          this.wsConnection?.send(
            JSON.stringify({
              method: 'subscribe',
              subscription: { type: 'allMids' },
            })
          )
        })
      }

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.channel === 'allMids' && data.data?.mids) {
            Array.from(this.priceSubscriptions.entries()).forEach(([symbol, callbacks]) => {
              const mid = data.data.mids[symbol]
              if (mid) {
                const price: PriceData = {
                  symbol,
                  price: parseFloat(mid),
                  change24h: 0,
                  volume24h: 0,
                  high24h: 0,
                  low24h: 0,
                  lastUpdated: Date.now(),
                  source: this.name,
                }
                callbacks.forEach((cb: (price: PriceData) => void) => cb(price))
              }
            })
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      this.wsConnection.onclose = () => {
        this.wsConnection = null
        // Reconnect after delay
        setTimeout(() => this.initWebSocket(), 5000)
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }
}

export const hyperliquidProvider = new HyperliquidProvider()
