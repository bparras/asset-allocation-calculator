export type Currency = 'USD' | 'EUR' | 'GBP'
export type ExchangeRates = Record<AssetSymbol, number>

export const ASSETS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
  },
] as const

export type AssetSymbol = (typeof ASSETS)[number]['symbol']

export interface AssetAllocation {
  symbol: AssetSymbol
  name: string
  percentage: number
  fiatAmount: number | null
  exchangeRate: number | null
  cryptoQuantity: number | null
}
export interface SavedInputs {
  amount: string
  currency: Currency
  primaryPercent: number
}
