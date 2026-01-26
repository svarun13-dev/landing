'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowDownUp, Zap, Settings, ChevronDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { NumberInput, Select } from '@/components/ui'
import { formatUSD, cn } from '@/lib/utils'
import { useTradeStore } from '@/lib/store'
import { getAssetsByUnderlying } from '@/config/assets'
import { CHAIN_NAMES } from '@/config/chains'

interface TradePanelProps {
  asset: string
  price: number
}

export function TradePanel({ asset, price }: TradePanelProps) {
  const { isConnected } = useAccount()
  const {
    inputToken,
    outputToken,
    inputAmount,
    slippage,
    isSwapping,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setSlippage,
    setSwapping,
    swapTokens,
  } = useTradeStore()

  const [showSettings, setShowSettings] = useState(false)

  const assets = getAssetsByUnderlying(asset)
  const spotAssets = assets.filter((a) => a.category === 'tokenized-spot')

  // Calculate output amount
  const inputValue = parseFloat(inputAmount) || 0
  const outputValue = inputToken === 'USDC' ? inputValue / price : inputValue * price

  // Estimate fees and route
  const estimatedFees = inputValue * 0.003 // 0.3% total
  const bestRoute = spotAssets[0]?.providers[0]?.name || 'Backed'

  const handleSwap = async () => {
    if (!isConnected || isSwapping || !inputAmount) return

    setSwapping(true)
    try {
      // Simulate swap delay
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // In production, would execute the actual swap
      alert('Swap executed successfully!')
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setSwapping(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Swap</CardTitle>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings */}
        {showSettings && (
          <div className="rounded-lg border border-border bg-secondary/50 p-3">
            <p className="text-sm font-medium text-foreground mb-2">
              Slippage Tolerance
            </p>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    slippage === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {value}%
                </button>
              ))}
              <NumberInput
                value={slippage.toString()}
                onChange={(v) => setSlippage(parseFloat(v) || 0.5)}
                className="w-16 text-center"
                placeholder="%"
              />
            </div>
          </div>
        )}

        {/* Input Token */}
        <div className="rounded-lg border border-border bg-secondary/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">You pay</span>
            <span className="text-sm text-muted-foreground">
              Balance: 50,000 USDC
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NumberInput
              value={inputAmount}
              onChange={setInputAmount}
              placeholder="0.00"
              className="flex-1 border-0 bg-transparent text-2xl font-semibold focus:ring-0"
            />
            <button
              className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 transition-colors hover:bg-muted"
              onClick={() => setInputToken(inputToken === 'USDC' ? asset : 'USDC')}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-bold text-primary">
                  {inputToken === 'USDC' ? 'U' : asset.slice(0, 1)}
                </span>
              </div>
              <span className="font-medium">
                {inputToken === 'USDC' ? 'USDC' : asset}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          {inputValue > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              ≈ {formatUSD(inputToken === 'USDC' ? inputValue : inputValue * price)}
            </p>
          )}
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center -my-2">
          <button
            onClick={swapTokens}
            className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-secondary"
          >
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Output Token */}
        <div className="rounded-lg border border-border bg-secondary/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">You receive</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl font-semibold text-foreground tabular-nums">
              {outputValue > 0 ? outputValue.toFixed(6) : '0.00'}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                <span className="text-xs font-bold text-success">
                  {inputToken === 'USDC' ? asset.slice(0, 1) : 'U'}
                </span>
              </div>
              <span className="font-medium">
                {inputToken === 'USDC' ? asset : 'USDC'}
              </span>
            </div>
          </div>
          {outputValue > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              ≈ {formatUSD(inputToken === 'USDC' ? outputValue * price : outputValue)}
            </p>
          )}
        </div>

        {/* Route Info */}
        {inputValue > 0 && (
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rate</span>
              <span className="text-foreground">
                1 {asset} = {formatUSD(price)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Route</span>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-success" />
                <span className="text-foreground capitalize">{bestRoute}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated fees</span>
              <span className="text-foreground">{formatUSD(estimatedFees)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Slippage</span>
              <span className="text-foreground">{slippage}%</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button onClick={openConnectModal} className="w-full" size="lg">
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        ) : (
          <Button
            onClick={handleSwap}
            disabled={!inputAmount || inputValue <= 0 || isSwapping}
            isLoading={isSwapping}
            className="w-full"
            size="lg"
          >
            {isSwapping
              ? 'Swapping...'
              : inputValue <= 0
                ? 'Enter amount'
                : `Swap for ${(inputToken === 'USDC' ? asset : 'USDC')}`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
