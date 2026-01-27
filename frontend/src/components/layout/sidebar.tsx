"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Portfolio", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: BarChart3 },
  { href: "/trade", label: "Trade", icon: ArrowLeftRight },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col items-center border-r border-zinc-800 bg-zinc-950 py-4 gap-1">
      <div className="mb-6 text-lg font-bold text-indigo-400">M</div>
      {NAV.map((item) => {
        const active = item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              active
                ? "bg-indigo-600/20 text-indigo-400"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
            title={item.label}
          >
            <item.icon size={20} />
          </Link>
        );
      })}
    </aside>
  );
}
