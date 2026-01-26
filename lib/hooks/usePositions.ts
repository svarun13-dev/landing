'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { usePositionsStore } from '../store'
import { hyperliquidProvider } from '../providers/hyperliquid'
import type { PerpPosition, OpenPositionParams, ModifyPositionParams } from '../providers/types'

// Mock positions for demo
const MOCK_POSITIONS: PerpPosition[] = [
  {
    id: 'AAPL-0x123',
    symbol: 'AAPL',
    side: 'long',
    size: 50,
    entryPrice: 175.50,
    markPrice: 178.72,
    liquidationPrice: 140.00,
    margin: 1755,
    leverage: 5,
    unrealizedPnl: 161,
    unrealizedPnlPercent: 9.17,
    fundingRate: 0.0001,
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'NVDA-0x456',
    symbol: 'NVDA',
    side: 'long',
    size: 10,
    entryPrice: 850.00,
    markPrice: 875.38,
    liquidationPrice: 680.00,
    margin: 1700,
    leverage: 5,
    unrealizedPnl: 253.80,
    unrealizedPnlPercent: 14.93,
    fundingRate: 0.00015,
    timestamp: Date.now() - 172800000,
  },
  {
    id: 'TSLA-0x789',
    symbol: 'TSLA',
    side: 'short',
    size: 30,
    entryPrice: 185.00,
    markPrice: 177.48,
    liquidationPrice: 230.00,
    margin: 1110,
    leverage: 5,
    unrealizedPnl: 225.60,
    unrealizedPnlPercent: 20.32,
    fundingRate: -0.0002,
    timestamp: Date.now() - 259200000,
  },
]

export function usePositions() {
  const { address, isConnected } = useAccount()
  const { positions, setPositions, setLoading, totalMargin, totalUnrealizedPnl } =
    usePositionsStore()

  const query = useQuery({
    queryKey: ['positions', address],
    queryFn: async () => {
      if (!address) return []

      setLoading(true)

      // In production, fetch from Hyperliquid
      // const positions = await hyperliquidProvider.getPositions(address)

      // For MVP, use mock data
      await new Promise((resolve) => setTimeout(resolve, 300))
      setPositions(MOCK_POSITIONS)
      setLoading(false)

      return MOCK_POSITIONS
    },
    enabled: isConnected && !!address,
    refetchInterval: 10000, // Refresh every 10 seconds for positions
  })

  return {
    positions: positions.length > 0 ? positions : query.data || [],
    totalMargin,
    totalUnrealizedPnl,
    isLoading: query.isLoading,
    error: query.error,
    isConnected,
  }
}

export function useOpenPosition() {
  const queryClient = useQueryClient()
  const { addPosition } = usePositionsStore()

  return useMutation({
    mutationFn: async (params: OpenPositionParams) => {
      // In production, this would call hyperliquidProvider.openPosition
      // For MVP, simulate the action
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newPosition: PerpPosition = {
        id: `${params.symbol}-${Date.now()}`,
        symbol: params.symbol,
        side: params.side,
        size: params.size,
        entryPrice: params.price || 100, // Would come from execution
        markPrice: params.price || 100,
        liquidationPrice: params.side === 'long'
          ? (params.price || 100) * (1 - 1 / params.leverage)
          : (params.price || 100) * (1 + 1 / params.leverage),
        margin: params.size * (params.price || 100) / params.leverage,
        leverage: params.leverage,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        fundingRate: 0,
        timestamp: Date.now(),
      }

      return newPosition
    },
    onSuccess: (position) => {
      addPosition(position)
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

export function useClosePosition() {
  const queryClient = useQueryClient()
  const { removePosition } = usePositionsStore()

  return useMutation({
    mutationFn: async (positionId: string) => {
      // In production, call hyperliquidProvider.closePosition
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return positionId
    },
    onSuccess: (positionId) => {
      removePosition(positionId)
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

export function useModifyPosition() {
  const queryClient = useQueryClient()
  const { updatePosition } = usePositionsStore()

  return useMutation({
    mutationFn: async ({
      positionId,
      params,
    }: {
      positionId: string
      params: ModifyPositionParams
    }) => {
      // In production, call hyperliquidProvider.modifyPosition
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { positionId, params }
    },
    onSuccess: ({ positionId, params }) => {
      updatePosition(positionId, params)
      queryClient.invalidateQueries({ queryKey: ['positions'] })
    },
  })
}

export function useOrderBook(symbol: string) {
  return useQuery({
    queryKey: ['orderbook', symbol],
    queryFn: () => hyperliquidProvider.getOrderBook(symbol),
    enabled: !!symbol,
    refetchInterval: 1000, // Update every second
  })
}
