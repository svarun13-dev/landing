'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount, useBalance } from 'wagmi'
import { usePortfolioStore } from '../store'
import { SUPPORTED_CHAINS } from '@/config/chains'
import { ASSETS } from '@/config/assets'
import type { TokenBalance } from '../providers/types'
import { formatUnits } from 'viem'

// Mock portfolio data for demo
const MOCK_PORTFOLIO: TokenBalance[] = [
  {
    token: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
    symbol: 'OUSG',
    name: 'Ondo Short-Term US Government Bond Fund',
    balance: '5000000000000000000000', // 5000 tokens
    balanceUSD: 522600,
    chainId: 1,
    decimals: 18,
    logo: '/assets/ousg.png',
  },
  {
    token: '0x9E2D266d6C90f6C0D80a88159B15958f7135B8Af',
    symbol: 'bCSPX',
    name: 'Backed CSPX Core S&P 500',
    balance: '100000000000000000000', // 100 tokens
    balanceUSD: 52345,
    chainId: 8453,
    decimals: 18,
    logo: '/assets/bcspx.png',
  },
  {
    token: '0x4b5e15a7b26c8E57B48aE2D80E8eb4bBe16c8dC7',
    symbol: 'bNVDA',
    name: 'Backed NVIDIA',
    balance: '25000000000000000000', // 25 tokens
    balanceUSD: 21884.5,
    chainId: 8453,
    decimals: 18,
    logo: '/assets/bnvda.png',
  },
  {
    token: '0x1234567890abcdef1234567890abcdef12345678',
    symbol: 'dTSLA',
    name: 'Dinari Tesla',
    balance: '150000000000000000000', // 150 tokens
    balanceUSD: 26622,
    chainId: 42161,
    decimals: 18,
    logo: '/assets/dtsla.png',
  },
  {
    token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '50000000000', // 50000 USDC (6 decimals)
    balanceUSD: 50000,
    chainId: 1,
    decimals: 6,
    logo: '/assets/usdc.png',
  },
]

export function usePortfolio() {
  const { address, isConnected } = useAccount()
  const { balances, setBalances, setLoading, totalValueUSD, pnl24h, pnlPercent24h } =
    usePortfolioStore()

  const query = useQuery({
    queryKey: ['portfolio', address],
    queryFn: async () => {
      if (!address) return []

      setLoading(true)

      // In production, this would fetch actual balances from all chains
      // For MVP, we'll use mock data but simulate the fetch
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate having a portfolio
      const portfolio = MOCK_PORTFOLIO
      setBalances(portfolio)
      setLoading(false)

      return portfolio
    },
    enabled: isConnected && !!address,
    refetchInterval: 60000, // Refresh every minute
  })

  return {
    balances: balances.length > 0 ? balances : query.data || [],
    totalValueUSD,
    pnl24h,
    pnlPercent24h,
    isLoading: query.isLoading,
    error: query.error,
    isConnected,
  }
}

export function useTokenBalance(tokenAddress: string, chainId: number) {
  const { address } = useAccount()

  const balance = useBalance({
    address,
    token: tokenAddress as `0x${string}`,
    chainId: chainId as 1 | 8453 | 42161,
  })

  return {
    balance: balance.data,
    isLoading: balance.isLoading,
    error: balance.error,
  }
}

export function useNativeBalance(chainId: number) {
  const { address } = useAccount()

  const balance = useBalance({
    address,
    chainId: chainId as 1 | 8453 | 42161,
  })

  return {
    balance: balance.data,
    isLoading: balance.isLoading,
    error: balance.error,
  }
}

// Calculate portfolio allocation
export function usePortfolioAllocation() {
  const { balances, totalValueUSD } = usePortfolioStore()

  const allocation = balances.map((b) => ({
    symbol: b.symbol,
    name: b.name,
    value: b.balanceUSD,
    percentage: totalValueUSD > 0 ? (b.balanceUSD / totalValueUSD) * 100 : 0,
    chainId: b.chainId,
  }))

  // Group by chain
  const byChain = allocation.reduce(
    (acc, item) => {
      const existing = acc.find((a) => a.chainId === item.chainId)
      if (existing) {
        existing.value += item.value
        existing.percentage += item.percentage
      } else {
        acc.push({
          chainId: item.chainId,
          value: item.value,
          percentage: item.percentage,
        })
      }
      return acc
    },
    [] as { chainId: number; value: number; percentage: number }[]
  )

  return { byAsset: allocation, byChain }
}
