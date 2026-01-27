import { mainnet, base, arbitrum } from 'viem/chains'
import type { Chain } from 'viem'

export const SUPPORTED_CHAINS = [mainnet, base, arbitrum] as const

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]['id']

// Solana is not EVM - handled separately via its own adapter
export const SOLANA_CHAIN_ID = 900

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  8453: 'Base',
  42161: 'Arbitrum',
  [SOLANA_CHAIN_ID]: 'Solana',
}

export const CHAIN_COLORS: Record<number, string> = {
  1: '#627EEA',
  8453: '#0052FF',
  42161: '#28A0F0',
  [SOLANA_CHAIN_ID]: '#9945FF',
}

export const RPC_URLS: Record<number, string[]> = {
  1: [
    process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
  ],
  8453: [
    process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://base.llamarpc.com',
    'https://mainnet.base.org',
  ],
  42161: [
    process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arbitrum.llamarpc.com',
    'https://arb1.arbitrum.io/rpc',
  ],
}

export function getChainById(chainId: number): Chain | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId)
}
