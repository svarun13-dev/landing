"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, Wallet, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASSETS, HELD_SYMBOLS } from "@/lib/data";
import { Asset, AssetCategory } from "@/lib/types";
import { cn, formatPercent, formatUSD, formatVolume } from "@/lib/utils";
import { usePreferences } from "@/lib/store";

const TABS: { label: string; value: AssetCategory | "favorites" }[] = [
  { label: "All", value: "all" },
  { label: "Stocks", value: "stocks" },
  { label: "ETFs", value: "etfs" },
  { label: "Treasuries", value: "treasuries" },
];

type SortKey = "price" | "change24h" | "volume24h";
type SortDir = "asc" | "desc";

export default function MarketsPage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<AssetCategory | "favorites">("all");
  const [sortKey, setSortKey] = useState<SortKey>("volume24h");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [hoveredTrade, setHoveredTrade] = useState<string | null>(null);
  const favorites = usePreferences((s) => s.favorites);
  const toggleFavorite = usePreferences((s) => s.toggleFavorite);

  // Keyboard shortcut: / or Cmd+K to focus search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
        document.activeElement !== searchRef.current
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey]
  );

  const filtered = useMemo(() => {
    let list = ASSETS;

    // search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    // tab
    if (tab === "favorites") {
      list = list.filter((a) => favorites.has(a.symbol));
    } else if (tab !== "all") {
      list = list.filter((a) => a.category === tab);
    }

    // sort
    const dir = sortDir === "desc" ? -1 : 1;
    list = [...list].sort((a, b) => (a[sortKey] - b[sortKey]) * dir);

    return list;
  }, [search, tab, sortKey, sortDir, favorites]);

  // Group assets by category for visual separation (only in "all" tab)
  const grouped = useMemo(() => {
    if (tab !== "all" && tab !== "favorites") return null;
    const groups: { label: string; assets: Asset[] }[] = [];
    const cats: { key: AssetCategory; label: string }[] = [
      { key: "stocks", label: "Stocks" },
      { key: "etfs", label: "ETFs" },
      { key: "treasuries", label: "Fixed Income" },
    ];
    for (const cat of cats) {
      const items = filtered.filter((a) => a.category === cat.key);
      if (items.length > 0) groups.push({ label: cat.label, assets: items });
    }
    return groups;
  }, [tab, filtered]);

  const renderRow = (asset: Asset) => {
    const best = asset.venues[asset.bestVenueIndex];
    const isHeld = HELD_SYMBOLS.has(asset.symbol);
    const isPositive = asset.change24h >= 0;
    const isFav = favorites.has(asset.symbol);

    return (
      <tr
        key={asset.symbol}
        onClick={() => router.push(`/asset/${asset.symbol}`)}
        className="group cursor-pointer border-b border-zinc-800/50 transition-colors hover:bg-white/[0.02]"
      >
        {/* Favorite */}
        <td className="w-10 py-3 pl-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(asset.symbol);
            }}
            className="text-zinc-600 hover:text-yellow-400 transition-colors"
          >
            <Star
              size={14}
              className={cn(isFav && "fill-yellow-400 text-yellow-400")}
            />
          </button>
        </td>

        {/* Asset name + ticker + held indicator */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-1.5 font-medium text-sm text-zinc-100">
                {asset.symbol}
                {isHeld && (
                  <span title="In your portfolio">
                    <Wallet size={12} className="text-indigo-400" />
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-500">{asset.name}</div>
            </div>
          </div>
        </td>

        {/* Price — primary visual weight */}
        <td className="py-3 pr-4 text-right tabular-nums font-medium text-sm text-zinc-100">
          {formatUSD(asset.price)}
        </td>

        {/* 24h change — primary visual weight */}
        <td
          className={cn(
            "py-3 pr-4 text-right tabular-nums text-sm font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {formatPercent(asset.change24h)}
        </td>

        {/* Volume — de-emphasized */}
        <td className="py-3 pr-4 text-right tabular-nums text-xs text-zinc-500">
          {formatVolume(asset.volume24h)}
        </td>

        {/* Venues — de-emphasized, best venue highlighted */}
        <td className="py-3 pr-4">
          <div className="flex flex-wrap gap-1">
            {asset.venues.map((v, i) => (
              <span
                key={v.name}
                className={cn(
                  "text-[11px] px-1.5 py-0.5 rounded",
                  i === asset.bestVenueIndex
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-zinc-600"
                )}
              >
                {v.name}
                {i === asset.bestVenueIndex && (
                  <span className="ml-1 text-[9px] text-indigo-500">Best</span>
                )}
              </span>
            ))}
          </div>
        </td>

        {/* Trade CTA */}
        <td className="py-3 pr-4 text-right">
          <div
            className="relative inline-block"
            onMouseEnter={() => setHoveredTrade(asset.symbol)}
            onMouseLeave={() => setHoveredTrade(null)}
          >
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/trade/${asset.symbol}`);
              }}
            >
              Trade
            </Button>
            {/* Hover tooltip: best venue + price */}
            {hoveredTrade === asset.symbol && (
              <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 shadow-lg z-10">
                Best via {best.name} @ {formatUSD(best.price)}
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const SortHeader = ({
    label,
    sortKeyProp,
    align = "right",
  }: {
    label: string;
    sortKeyProp: SortKey;
    align?: "left" | "right";
  }) => (
    <th
      className={cn(
        "py-2 pr-4 text-xs font-medium text-zinc-500 cursor-pointer select-none hover:text-zinc-300 transition-colors",
        align === "right" && "text-right"
      )}
      onClick={() => toggleSort(sortKeyProp)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === sortKeyProp && (
          <ArrowUpDown size={10} className="text-indigo-400" />
        )}
      </span>
    </th>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Markets</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Discover and trade tokenized assets
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search name, ticker, or sector…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-2 pl-9 pr-10 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 border border-zinc-700 rounded px-1 py-0.5">
            /
          </kbd>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-zinc-900/50 border border-zinc-800 p-0.5">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                tab === t.value
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="w-10 py-2 pl-4" />
              <th className="py-2 pr-4 text-left text-xs font-medium text-zinc-500">
                Asset
              </th>
              <SortHeader label="Price" sortKeyProp="price" />
              <SortHeader label="24h %" sortKeyProp="change24h" />
              <SortHeader label="Volume" sortKeyProp="volume24h" />
              <th className="py-2 pr-4 text-left text-xs font-medium text-zinc-500">
                Venues
              </th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {grouped
              ? grouped.map((group) => (
                  <Fragment key={group.label}>
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {group.assets.map(renderRow)}
                  </Fragment>
                ))
              : filtered.map(renderRow)}
          </tbody>
        </table>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Search size={32} className="mb-3 text-zinc-700" />
            <p className="text-sm">No assets found</p>
            <p className="text-xs text-zinc-600 mt-1">
              Try a different search term or category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
