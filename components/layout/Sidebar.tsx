'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LineChart,
  ArrowLeftRight,
  Layers,
  Wallet,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Markets', href: '/markets', icon: LineChart },
  { name: 'Trade', href: '/trade', icon: ArrowLeftRight },
  { name: 'Positions', href: '/positions', icon: Layers },
]

const secondaryNavigation = [
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">OnChain</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Stats Card */}
        <div className="mt-auto rounded-lg border border-border bg-secondary/50 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Total Protocol TVL
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">$2.4B</p>
          <p className="mt-1 text-xs text-success">+12.5% from last month</p>
        </div>
      </nav>
    </aside>
  )
}
