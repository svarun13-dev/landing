import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, base, arbitrum } from 'wagmi/chains'
import { http } from 'wagmi'
import { hyperliquid, RPC_URLS } from '@/config/chains'

export const config = getDefaultConfig({
  appName: 'OnChain Broker',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [mainnet, base, arbitrum, hyperliquid],
  transports: {
    [mainnet.id]: http(RPC_URLS[1][0]),
    [base.id]: http(RPC_URLS[8453][0]),
    [arbitrum.id]: http(RPC_URLS[42161][0]),
    [hyperliquid.id]: http(RPC_URLS[998][0]),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
