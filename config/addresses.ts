// Contract addresses for various protocols and tokens

export const ADDRESSES = {
  // Stablecoins
  USDC: {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
    42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
  },
  USDT: {
    1: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },

  // Ondo Finance
  ONDO: {
    OUSG: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
    USDY: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
    OMMF: '0x0E9D0BB0a6eC69Fe39D3e47c5f3E8Bd4F7Ca1c77',
  },

  // Backed Finance (Base)
  BACKED: {
    bCSPX: '0x9E2D266d6C90f6C0D80a88159B15958f7135B8Af',
    bNVDA: '0x4b5e15a7b26c8E57B48aE2D80E8eb4bBe16c8dC7',
    bCOIN: '0x2BbE65C7d6eA4AE4e7E8E72f2E6b2D44BD4C1e5f',
    bIB01: '0xCA30c93B02514f86d5C86a6e375E3A330B435Fb5',
  },

  // DEX Routers
  ROUTERS: {
    UNISWAP_V3: {
      1: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      8453: '0x2626664c2603336E57B271c5C0b26F421741e481',
      42161: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    },
    SUSHISWAP: {
      1: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
      42161: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    },
  },

  // Aggregators
  AGGREGATORS: {
    ZERO_X: {
      1: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
      8453: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
      42161: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
    },
    ONE_INCH: {
      1: '0x1111111254EEB25477B68fb85Ed929f73A960582',
      8453: '0x1111111254EEB25477B68fb85Ed929f73A960582',
      42161: '0x1111111254EEB25477B68fb85Ed929f73A960582',
    },
  },

  // Bridge contracts (for cross-chain)
  BRIDGES: {
    SOCKET: {
      1: '0x3a23F943181408EAC424116Af7b7790c94Cb97a5',
      8453: '0x3a23F943181408EAC424116Af7b7790c94Cb97a5',
      42161: '0x3a23F943181408EAC424116Af7b7790c94Cb97a5',
    },
    LIFI: {
      1: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      8453: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      42161: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
    },
  },

  // Hyperliquid
  HYPERLIQUID: {
    BRIDGE: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7', // Arbitrum bridge
    API: 'https://api.hyperliquid.xyz',
    WS: 'wss://api.hyperliquid.xyz/ws',
  },
} as const

export type ChainAddresses<T> = {
  [chainId: number]: T
}

export function getAddress<T>(
  addresses: ChainAddresses<T>,
  chainId: number
): T | undefined {
  return addresses[chainId]
}
