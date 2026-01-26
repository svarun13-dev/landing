'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Bell, Settings, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/markets': 'Markets',
  '/trade': 'Trade',
  '/positions': 'Positions',
}

export function Navbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || 'OnChain Broker'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            className="h-9 w-64 rounded-lg border border-border bg-secondary pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Settings */}
        <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Settings className="h-5 w-5" />
        </button>

        {/* Wallet Connect */}
        <ConnectButton
          chainStatus="icon"
          showBalance={{ smallScreen: false, largeScreen: true }}
        />
      </div>
    </header>
  )
}
