import { mainnet, base, arbitrum } from 'viem/chains'
import type { Chain } from 'viem'

// Hyperliquid L1 custom chain definition
export const hyperliquid: Chain = {
  id: 998,
  name: 'Hyperliquid',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://api.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperliquid Explorer',
      url: 'https://explorer.hyperliquid.xyz',
    },
  },
}

export const SUPPORTED_CHAINS = [mainnet, base, arbitrum, hyperliquid] as const

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]['id']

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
  998: 'Hyperliquid',
}

export const CHAIN_ICONS: Record<number, string> = {
  1: '/chains/ethereum.svg',
  8453: '/chains/base.svg',
  42161: '/chains/arbitrum.svg',
  998: '/chains/hyperliquid.svg',
}

export const CHAIN_COLORS: Record<number, string> = {
  1: '#627EEA',
  8453: '#0052FF',
  42161: '#28A0F0',
  998: '#00D395',
}

// RPC URLs with fallbacks
export const RPC_URLS: Record<number, string[]> = {
  1: [
    process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
  ],
  8453: [
    process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://base.llamarpc.com',
    'https://mainnet.base.org',
    'https://base.publicnode.com',
  ],
  42161: [
    process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arbitrum.llamarpc.com',
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum-one.publicnode.com',
  ],
  998: ['https://api.hyperliquid.xyz/evm'],
}

export function getChainById(chainId: number): Chain | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)
}

export function isChainSupported(chainId: number): boolean {
  return SUPPORTED_CHAINS.some((chain) => chain.id === chainId)
}
