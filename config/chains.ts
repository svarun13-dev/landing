// Solana-only for MVP. EVM chains (Ethereum, Base, Arbitrum) to be added later.

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

export const SOLANA_CHAIN = {
  id: 'solana',
  name: 'Solana',
  color: '#9945FF',
  rpcUrl: SOLANA_RPC_URL,
  explorer: 'https://solscan.io',
} as const
