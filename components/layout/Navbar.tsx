'use client'

import dynamic from 'next/dynamic'
import { Search } from 'lucide-react'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false }
)

export function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assets..."
          className="h-8 w-72 rounded-md border border-border bg-background pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      <WalletMultiButton style={{
        backgroundColor: 'var(--secondary)',
        height: '36px',
        fontSize: '13px',
        borderRadius: '6px',
        fontFamily: 'inherit',
      }} />
    </header>
  )
}
