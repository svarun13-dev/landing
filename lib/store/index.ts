import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PriceData, TokenBalance, PerpPosition } from '../providers/types'
import type { AggregatedPrice } from '../aggregator'

// Portfolio Store
interface PortfolioState {
  balances: TokenBalance[]
  totalValueUSD: number
  pnl24h: number
  pnlPercent24h: number
  isLoading: boolean
  lastUpdated: number | null
  setBalances: (balances: TokenBalance[]) => void
  setLoading: (loading: boolean) => void
  calculateTotals: () => void
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  balances: [],
  totalValueUSD: 0,
  pnl24h: 0,
  pnlPercent24h: 0,
  isLoading: false,
  lastUpdated: null,

  setBalances: (balances) => {
    set({ balances, lastUpdated: Date.now() })
    get().calculateTotals()
  },

  setLoading: (isLoading) => set({ isLoading }),

  calculateTotals: () => {
    const { balances } = get()
    const totalValueUSD = balances.reduce((sum, b) => sum + b.balanceUSD, 0)
    // Mock P&L calculation
    const pnl24h = totalValueUSD * 0.015 // ~1.5% mock gain
    const pnlPercent24h = 1.5

    set({ totalValueUSD, pnl24h, pnlPercent24h })
  },
}))

// Prices Store
interface PricesState {
  prices: Map<string, PriceData>
  aggregatedPrices: AggregatedPrice[]
  isLoading: boolean
  lastUpdated: number | null
  setPrices: (prices: Map<string, PriceData>) => void
  setAggregatedPrices: (prices: AggregatedPrice[]) => void
  setLoading: (loading: boolean) => void
  getPrice: (symbol: string) => PriceData | undefined
}

export const usePricesStore = create<PricesState>((set, get) => ({
  prices: new Map(),
  aggregatedPrices: [],
  isLoading: false,
  lastUpdated: null,

  setPrices: (prices) => set({ prices, lastUpdated: Date.now() }),

  setAggregatedPrices: (aggregatedPrices) =>
    set({ aggregatedPrices, lastUpdated: Date.now() }),

  setLoading: (isLoading) => set({ isLoading }),

  getPrice: (symbol) => get().prices.get(symbol),
}))

// Positions Store (for perps)
interface PositionsState {
  positions: PerpPosition[]
  totalMargin: number
  totalUnrealizedPnl: number
  isLoading: boolean
  lastUpdated: number | null
  setPositions: (positions: PerpPosition[]) => void
  setLoading: (loading: boolean) => void
  addPosition: (position: PerpPosition) => void
  removePosition: (positionId: string) => void
  updatePosition: (positionId: string, updates: Partial<PerpPosition>) => void
}

export const usePositionsStore = create<PositionsState>((set, get) => ({
  positions: [],
  totalMargin: 0,
  totalUnrealizedPnl: 0,
  isLoading: false,
  lastUpdated: null,

  setPositions: (positions) => {
    const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0)
    const totalUnrealizedPnl = positions.reduce(
      (sum, p) => sum + p.unrealizedPnl,
      0
    )
    set({ positions, totalMargin, totalUnrealizedPnl, lastUpdated: Date.now() })
  },

  setLoading: (isLoading) => set({ isLoading }),

  addPosition: (position) => {
    const positions = [...get().positions, position]
    get().setPositions(positions)
  },

  removePosition: (positionId) => {
    const positions = get().positions.filter((p) => p.id !== positionId)
    get().setPositions(positions)
  },

  updatePosition: (positionId, updates) => {
    const positions = get().positions.map((p) =>
      p.id === positionId ? { ...p, ...updates } : p
    )
    get().setPositions(positions)
  },
}))

// Trade State
interface TradeState {
  inputToken: string
  outputToken: string
  inputAmount: string
  slippage: number
  isSwapping: boolean
  setInputToken: (token: string) => void
  setOutputToken: (token: string) => void
  setInputAmount: (amount: string) => void
  setSlippage: (slippage: number) => void
  setSwapping: (swapping: boolean) => void
  swapTokens: () => void
  reset: () => void
}

export const useTradeStore = create<TradeState>((set, get) => ({
  inputToken: 'USDC',
  outputToken: 'bCSPX',
  inputAmount: '',
  slippage: 0.5,
  isSwapping: false,

  setInputToken: (inputToken) => set({ inputToken }),
  setOutputToken: (outputToken) => set({ outputToken }),
  setInputAmount: (inputAmount) => set({ inputAmount }),
  setSlippage: (slippage) => set({ slippage }),
  setSwapping: (isSwapping) => set({ isSwapping }),

  swapTokens: () => {
    const { inputToken, outputToken } = get()
    set({ inputToken: outputToken, outputToken: inputToken })
  },

  reset: () =>
    set({
      inputToken: 'USDC',
      outputToken: 'bCSPX',
      inputAmount: '',
      isSwapping: false,
    }),
}))

// Perp Trade State
interface PerpTradeState {
  symbol: string
  side: 'long' | 'short'
  size: string
  leverage: number
  orderType: 'market' | 'limit'
  limitPrice: string
  stopLoss: string
  takeProfit: string
  isSubmitting: boolean
  setSymbol: (symbol: string) => void
  setSide: (side: 'long' | 'short') => void
  setSize: (size: string) => void
  setLeverage: (leverage: number) => void
  setOrderType: (orderType: 'market' | 'limit') => void
  setLimitPrice: (price: string) => void
  setStopLoss: (price: string) => void
  setTakeProfit: (price: string) => void
  setSubmitting: (submitting: boolean) => void
  reset: () => void
}

export const usePerpTradeStore = create<PerpTradeState>((set) => ({
  symbol: 'AAPL-PERP',
  side: 'long',
  size: '',
  leverage: 5,
  orderType: 'market',
  limitPrice: '',
  stopLoss: '',
  takeProfit: '',
  isSubmitting: false,

  setSymbol: (symbol) => set({ symbol }),
  setSide: (side) => set({ side }),
  setSize: (size) => set({ size }),
  setLeverage: (leverage) => set({ leverage }),
  setOrderType: (orderType) => set({ orderType }),
  setLimitPrice: (limitPrice) => set({ limitPrice }),
  setStopLoss: (stopLoss) => set({ stopLoss }),
  setTakeProfit: (takeProfit) => set({ takeProfit }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  reset: () =>
    set({
      symbol: 'AAPL-PERP',
      side: 'long',
      size: '',
      leverage: 5,
      orderType: 'market',
      limitPrice: '',
      stopLoss: '',
      takeProfit: '',
      isSubmitting: false,
    }),
}))

// User Preferences
interface PreferencesState {
  theme: 'dark' | 'light'
  currency: 'USD' | 'EUR' | 'GBP'
  showTestnets: boolean
  favoriteAssets: string[]
  setTheme: (theme: 'dark' | 'light') => void
  setCurrency: (currency: 'USD' | 'EUR' | 'GBP') => void
  toggleTestnets: () => void
  addFavorite: (asset: string) => void
  removeFavorite: (asset: string) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      currency: 'USD',
      showTestnets: false,
      favoriteAssets: [],

      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      toggleTestnets: () => set({ showTestnets: !get().showTestnets }),

      addFavorite: (asset) =>
        set({ favoriteAssets: [...get().favoriteAssets, asset] }),

      removeFavorite: (asset) =>
        set({
          favoriteAssets: get().favoriteAssets.filter((a) => a !== asset),
        }),
    }),
    {
      name: 'onchain-broker-preferences',
    }
  )
)
