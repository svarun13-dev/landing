import { Asset, PortfolioHolding } from "./types";

export const ASSETS: Asset[] = [
  {
    symbol: "AAPL", name: "Apple Inc.", category: "stocks",
    price: 178.74, change24h: 1.23, volume24h: 2_340_000_000,
    venues: [
      { name: "xStocks", price: 178.74, fees: 0.1 },
      { name: "Securitize", price: 178.81, fees: 0.15 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "GOOGL", name: "Alphabet Inc.", category: "stocks",
    price: 141.52, change24h: -0.87, volume24h: 1_870_000_000,
    venues: [
      { name: "xStocks", price: 141.55, fees: 0.1 },
      { name: "Securitize", price: 141.52, fees: 0.12 },
    ],
    bestVenueIndex: 1,
  },
  {
    symbol: "MSFT", name: "Microsoft Corp.", category: "stocks",
    price: 412.38, change24h: 2.45, volume24h: 3_100_000_000,
    venues: [
      { name: "xStocks", price: 412.38, fees: 0.1 },
      { name: "Dinari", price: 412.50, fees: 0.08 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "TSLA", name: "Tesla Inc.", category: "stocks",
    price: 248.91, change24h: -3.12, volume24h: 4_500_000_000,
    venues: [
      { name: "xStocks", price: 248.91, fees: 0.1 },
      { name: "Dinari", price: 249.10, fees: 0.08 },
      { name: "Securitize", price: 249.05, fees: 0.15 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "NVDA", name: "NVIDIA Corp.", category: "stocks",
    price: 875.30, change24h: 4.56, volume24h: 5_200_000_000,
    venues: [
      { name: "xStocks", price: 875.30, fees: 0.1 },
      { name: "Securitize", price: 875.90, fees: 0.15 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "AMZN", name: "Amazon.com Inc.", category: "stocks",
    price: 185.60, change24h: 0.34, volume24h: 2_100_000_000,
    venues: [
      { name: "Dinari", price: 185.60, fees: 0.08 },
      { name: "Securitize", price: 185.72, fees: 0.15 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "META", name: "Meta Platforms", category: "stocks",
    price: 505.12, change24h: 1.89, volume24h: 2_800_000_000,
    venues: [
      { name: "xStocks", price: 505.12, fees: 0.1 },
      { name: "Dinari", price: 505.30, fees: 0.08 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "JPM", name: "JPMorgan Chase", category: "stocks",
    price: 198.45, change24h: -0.52, volume24h: 1_200_000_000,
    venues: [
      { name: "xStocks", price: 198.45, fees: 0.1 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "V", name: "Visa Inc.", category: "stocks",
    price: 279.30, change24h: 0.78, volume24h: 980_000_000,
    venues: [
      { name: "xStocks", price: 279.30, fees: 0.1 },
      { name: "Securitize", price: 279.50, fees: 0.15 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "WMT", name: "Walmart Inc.", category: "stocks",
    price: 165.22, change24h: -1.05, volume24h: 870_000_000,
    venues: [
      { name: "Dinari", price: 165.22, fees: 0.08 },
    ],
    bestVenueIndex: 0,
  },
  // ETFs
  {
    symbol: "SPY", name: "S&P 500 ETF", category: "etfs",
    price: 502.14, change24h: 0.92, volume24h: 8_500_000_000,
    venues: [
      { name: "xStocks", price: 502.14, fees: 0.05 },
      { name: "Securitize", price: 502.30, fees: 0.1 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "QQQ", name: "Nasdaq 100 ETF", category: "etfs",
    price: 438.76, change24h: 1.45, volume24h: 5_200_000_000,
    venues: [
      { name: "xStocks", price: 438.76, fees: 0.05 },
      { name: "Dinari", price: 438.90, fees: 0.06 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "IWM", name: "Russell 2000 ETF", category: "etfs",
    price: 207.89, change24h: -0.63, volume24h: 3_100_000_000,
    venues: [
      { name: "xStocks", price: 207.89, fees: 0.05 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "GLD", name: "Gold ETF", category: "etfs",
    price: 191.34, change24h: 0.22, volume24h: 1_800_000_000,
    venues: [
      { name: "Securitize", price: 191.34, fees: 0.1 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "VTI", name: "Total Stock Market ETF", category: "etfs",
    price: 261.50, change24h: 0.81, volume24h: 2_400_000_000,
    venues: [
      { name: "xStocks", price: 261.50, fees: 0.05 },
      { name: "Securitize", price: 261.65, fees: 0.1 },
    ],
    bestVenueIndex: 0,
  },
  // Treasuries
  {
    symbol: "OUSG", name: "Ondo US Gov Bond", category: "treasuries",
    price: 104.52, change24h: 0.02, volume24h: 450_000_000,
    venues: [
      { name: "Ondo", price: 104.52, fees: 0.0 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "USDY", name: "Ondo US Dollar Yield", category: "treasuries",
    price: 1.05, change24h: 0.01, volume24h: 320_000_000,
    venues: [
      { name: "Ondo", price: 1.05, fees: 0.0 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "IB01", name: "iShares $ Treasury 0-1yr", category: "treasuries",
    price: 111.23, change24h: 0.03, volume24h: 280_000_000,
    venues: [
      { name: "Backed", price: 111.23, fees: 0.02 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "GOVT", name: "iShares US Treasury Bond", category: "treasuries",
    price: 22.87, change24h: -0.05, volume24h: 190_000_000,
    venues: [
      { name: "Backed", price: 22.87, fees: 0.02 },
    ],
    bestVenueIndex: 0,
  },
  {
    symbol: "TBIL", name: "US Treasury 3 Month Bill", category: "treasuries",
    price: 50.12, change24h: 0.00, volume24h: 150_000_000,
    venues: [
      { name: "Securitize", price: 50.12, fees: 0.05 },
    ],
    bestVenueIndex: 0,
  },
];

// Sort by volume descending (default)
ASSETS.sort((a, b) => b.volume24h - a.volume24h);

export const PORTFOLIO_HOLDINGS: PortfolioHolding[] = [
  { symbol: "AAPL", amount: 15, valueUSD: 2681.10 },
  { symbol: "NVDA", amount: 5, valueUSD: 4376.50 },
  { symbol: "SPY", amount: 10, valueUSD: 5021.40 },
  { symbol: "OUSG", amount: 500, valueUSD: 52260.00 },
  { symbol: "QQQ", amount: 8, valueUSD: 3510.08 },
];

export const HELD_SYMBOLS = new Set(PORTFOLIO_HOLDINGS.map((h) => h.symbol));
