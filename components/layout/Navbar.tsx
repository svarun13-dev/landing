'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Search } from 'lucide-react'

export function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assets..."
          className="h-8 w-72 rounded-md border border-border bg-background pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      {/* Wallet */}
      <ConnectButton
        chainStatus="icon"
        showBalance={{ smallScreen: false, largeScreen: true }}
        accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
      />
    </header>
  )
}
