'use client'

import * as React from 'react'
import {
  RainbowKitProvider,
  darkTheme,
  type Theme,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'

import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchInterval: 1000 * 30, // 30 seconds
    },
  },
})

const customTheme: Theme = {
  ...darkTheme(),
  colors: {
    ...darkTheme().colors,
    accentColor: '#6366f1',
    accentColorForeground: '#ffffff',
    modalBackground: '#111118',
    modalBackdrop: 'rgba(0, 0, 0, 0.7)',
    profileForeground: '#111118',
    closeButton: '#a1a1aa',
    closeButtonBackground: '#27272a',
    generalBorder: '#27272a',
    generalBorderDim: '#1e1e2e',
    menuItemBackground: '#1e1e2e',
    modalText: '#fafafa',
    modalTextDim: '#a1a1aa',
    modalTextSecondary: '#71717a',
    selectedOptionBorder: '#6366f1',
    standby: '#f59e0b',
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
  },
  radii: {
    ...darkTheme().radii,
    modal: '16px',
    modalMobile: '16px',
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={customTheme}
          modalSize="compact"
          showRecentTransactions={true}
        >
          {mounted ? children : null}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
