# OnChain Broker

A non-custodial aggregator for tokenized stocks and stock perpetuals. Think Interactive Brokers meets 1inch - best price routing across multiple tokenized equity providers and perp venues, unified in one clean interface.

## Features

### Asset Discovery & Price Aggregation
- **Supported Spot Tokenized Stocks:**
  - Ondo Finance (OUSG, USDY - Treasury products)
  - Backed Finance (bCSPX, bNVDA, bCOIN, bIB01 on Base)
  - Dinari (dAAPL, dGOOGL, dTSLA, dAMZN, dMSFT, dMETA on Arbitrum)

- **Supported Perp Venues:**
  - Hyperliquid (stock perps)
  - Ostium (expandable)

### Unified Dashboard
- Connect wallet via RainbowKit
- View all tokenized stock holdings across chains
- Track perp positions
- Real-time P&L tracking
- Portfolio allocation visualization

### Trade Execution
- **Spot Trades:**
  - Best price routing across venues
  - Cross-chain support
  - Fee comparison

- **Perp Trades:**
  - Long/short interface
  - Adjustable leverage (1-50x)
  - Stop loss & take profit
  - Position management

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **State Management:** Zustand
- **Wallet:** wagmi + viem + RainbowKit
- **Charts:** Recharts
- **Data Fetching:** TanStack Query

## Supported Chains

- Ethereum Mainnet (Ondo)
- Base (Backed)
- Arbitrum (Dinari, Hyperliquid bridge)
- Hyperliquid L1 (Perps)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Add your WalletConnect Project ID to .env.local
# Get one at: https://cloud.walletconnect.com/
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
/app
  /dashboard        # Portfolio overview
  /markets          # Browse all assets
  /trade/[asset]    # Trading interface
  /positions        # Perp position management

/components
  /ui               # Reusable UI components
  /portfolio        # Portfolio-specific components
  /trading          # Trading-specific components
  /charts           # Chart components
  /layout           # Layout components (Navbar, Sidebar)

/lib
  /providers        # Protocol integrations (Ondo, Backed, Dinari, Hyperliquid)
  /aggregator       # Price comparison & routing
  /hooks            # Custom React hooks
  /store            # Zustand stores
  /utils            # Utility functions

/config
  chains.ts         # Chain configurations
  assets.ts         # Asset definitions
  addresses.ts      # Contract addresses
```

## Environment Variables

```env
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional - for enhanced data
NEXT_PUBLIC_COINGECKO_API_KEY=
NEXT_PUBLIC_ONDO_API_KEY=
NEXT_PUBLIC_DINARI_API_KEY=

# Optional - custom RPC URLs
NEXT_PUBLIC_ETHEREUM_RPC_URL=
NEXT_PUBLIC_BASE_RPC_URL=
NEXT_PUBLIC_ARBITRUM_RPC_URL=
```

## MVP Success Criteria

- [x] Connect wallet and see all tokenized stock holdings
- [x] View prices for 10+ tokenized stocks across venues
- [x] Execute a spot swap through best route
- [x] Open/close a perp position on Hyperliquid
- [x] See unified P&L across spot and perps

## Security Considerations

- Non-custodial - users retain control of their assets
- No user data storage
- All transactions require wallet signature
- Price feeds from multiple sources

## Disclaimer

This is an MVP for demonstration purposes. Tokenized securities carry regulatory and counterparty risk. Perpetual positions can be liquidated. Trade responsibly.

## License

MIT
