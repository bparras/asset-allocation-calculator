import { describe, expect, it } from 'vitest'
import { parseExchangeRatesResponse } from './exchangeRatesService'

describe('coinbase response parsing', () => {
  const valid = {
    data: {
      currency: 'USD',
      rates: {
        BTC: '0.00001',
        ETH: '0.0005',
        OTHER: '100',
      },
    },
  }

  it('extracts configured crypto rates as numbers', () => {
    expect(parseExchangeRatesResponse(valid, 'USD')).toEqual({ BTC: 0.00001, ETH: 0.0005 })
  })

  it.each([
    ['zero', { BTC: '0', ETH: '0.001' }, 'Invalid exchange rate for BTC'],
    ['not a number', { BTC: 'NaN', ETH: '0.001' }, 'Invalid exchange rate for BTC'],
    ['missing', { BTC: '0.001' }, 'Missing exchange rate for ETH'],
  ])('rejects a %s rate', (_label, rates, message) => {
    expect(() => parseExchangeRatesResponse({ data: { currency: 'USD', rates } }, 'USD')).toThrow(
      message,
    )
  })
})
