'use client'

import { redirect } from 'next/navigation'

export default function TradePage() {
  // Redirect to a default asset
  redirect('/trade/AAPL')
}
