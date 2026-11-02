import { ASSETS, type Currency, type ExchangeRates } from '@/types/allocation'

const BASE_URL = 'https://api.coinbase.com/v2/exchange-rates'

export async function getExchangeRates(
  currency: Currency,
  signal?: AbortSignal,
): Promise<ExchangeRates> {
  const url = `${BASE_URL}?currency=${currency}`
  const res = await fetch(url, { signal })

  if (!res.ok) {
    throw new Error('Failed to get exchange rates')
  }

  const json = await res.json()
  return parseExchangeRatesResponse(json, currency)
}

export function parseExchangeRatesResponse(value: unknown, currency: Currency): ExchangeRates {
  if (!value || typeof value !== 'object') throw new Error('Invalid Coinbase response.')

  const result = value as {
    data?: {
      currency?: unknown
      rates?: Record<string, unknown>
    }
  }

  if (result.data?.currency !== currency || !result.data.rates) {
    throw new Error('Unexpected base currency or missing exchange rates.')
  }

  const rates = {} as ExchangeRates

  for (const asset of ASSETS) {
    const rawRate = result?.data?.rates[asset.symbol]
    if (typeof rawRate !== 'string' || !rawRate.trim()) {
      throw new Error(`Missing exchange rate for ${asset.symbol}`)
    }

    const rate = Number(rawRate)
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`Invalid exchange rate for ${asset.symbol}`)
    }

    rates[asset.symbol] = rate
  }

  return rates
}
