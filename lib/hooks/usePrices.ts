'use client'

import { useQuery } from '@tanstack/react-query'
import { usePricesStore } from '../store'
import { getAllPrices, getBestPrice } from '../providers'
import { aggregator } from '../aggregator'
import { ALL_ASSETS } from '@/config/assets'

export function usePrices() {
  const { prices, setPrices, setLoading } = usePricesStore()

  const query = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      setLoading(true)
      const symbols = ALL_ASSETS.map((a) => a.symbol)
      const priceData = await getAllPrices(symbols)
      setPrices(priceData)
      setLoading(false)
      return priceData
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  return {
    prices,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function usePrice(symbol: string) {
  const query = useQuery({
    queryKey: ['price', symbol],
    queryFn: async () => {
      const result = await getBestPrice(symbol)
      return result?.price || null
    },
    refetchInterval: 10000,
    staleTime: 5000,
  })

  return {
    price: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export function useAggregatedPrices() {
  const { aggregatedPrices, setAggregatedPrices, setLoading } = usePricesStore()

  const query = useQuery({
    queryKey: ['aggregated-prices'],
    queryFn: async () => {
      setLoading(true)
      const prices = await aggregator.getAllAggregatedPrices()
      setAggregatedPrices(prices)
      setLoading(false)
      return prices
    },
    refetchInterval: 30000,
    staleTime: 15000,
  })

  return {
    prices: aggregatedPrices.length > 0 ? aggregatedPrices : query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function usePriceComparison(underlying: string) {
  const query = useQuery({
    queryKey: ['price-comparison', underlying],
    queryFn: () => aggregator.comparePrices(underlying),
    enabled: !!underlying,
    refetchInterval: 30000,
  })

  return {
    comparison: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}
