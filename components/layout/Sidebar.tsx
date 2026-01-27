'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, ArrowRightLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { name: 'Portfolio', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Markets', href: '/markets', icon: BarChart3 },
  { name: 'Trade', href: '/trade', icon: ArrowRightLeft },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-[220px] flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-5 border-b border-border">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          OnChain<span className="text-muted-foreground font-normal ml-1">Broker</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {nav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
            (item.href === '/dashboard' && pathname === '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Non-custodial. Prices aggregated across venues. Not financial advice.
        </p>
      </div>
    </aside>
  )
}
