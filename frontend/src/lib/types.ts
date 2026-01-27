export type AssetCategory = "all" | "stocks" | "etfs" | "treasuries";

export interface Venue {
  name: string;
  price: number;
  fees: number;
}

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  volume24h: number;
  venues: Venue[];
  bestVenueIndex: number;
}

export interface PortfolioHolding {
  symbol: string;
  amount: number;
  valueUSD: number;
}
