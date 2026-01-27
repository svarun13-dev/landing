"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASSETS, HELD_SYMBOLS } from "@/lib/data";
import { formatPercent, formatUSD, formatVolume } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const router = useRouter();
  const asset = ASSETS.find((a) => a.symbol === symbol);

  if (!asset) {
    return (
      <div className="p-6">
        <p className="text-zinc-500">Asset not found.</p>
      </div>
    );
  }

  const isPositive = asset.change24h >= 0;
  const isHeld = HELD_SYMBOLS.has(asset.symbol);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Markets
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            {asset.symbol}
            {isHeld && (
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                In portfolio
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500">{asset.name}</p>
        </div>
        <Button onClick={() => router.push(`/trade/${asset.symbol}`)}>
          Trade {asset.symbol}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-xs text-zinc-500 mb-1">Price</div>
          <div className="text-lg font-medium tabular-nums">
            {formatUSD(asset.price)}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-xs text-zinc-500 mb-1">24h Change</div>
          <div
            className={cn(
              "text-lg font-medium tabular-nums",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {formatPercent(asset.change24h)}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="text-xs text-zinc-500 mb-1">24h Volume</div>
          <div className="text-lg font-medium tabular-nums">
            {formatVolume(asset.volume24h)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">
          Available Venues
        </h2>
        <div className="space-y-2">
          {asset.venues.map((v, i) => (
            <div
              key={v.name}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                i === asset.bestVenueIndex
                  ? "bg-indigo-500/5 border border-indigo-500/20"
                  : "border border-zinc-800"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-zinc-200">{v.name}</span>
                {i === asset.bestVenueIndex && (
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    Best
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 tabular-nums">
                <span className="text-zinc-400 text-xs">
                  Fee: {v.fees}%
                </span>
                <span className="text-zinc-100">{formatUSD(v.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
