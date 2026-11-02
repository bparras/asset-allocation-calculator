import type { Currency } from '@/types/allocation'

const currencyFormatters: Record<Currency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  EUR: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }),
  GBP: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GBP' }),
}

export function formatCurrency(amount: number, currency: Currency): string {
  return currencyFormatters[currency].format(amount)
}

export function formatPercent(percent: number): string {
  return `${Number(percent.toFixed(4))}%`
}

export function formatCurrecyInput(value: string): string {
  //auto add leading zero for decimal point start
  if (value === '.') {
    return `0.`
  }

  //remove all except digits and decimal point
  value = value.replace(/[^\d.]/g, '')

  const decimalCount = (value.match(/\./g) || []).length

  if (decimalCount > 1) {
    const firstDecimalIndex = value.indexOf('.')
    value =
      value.slice(0, firstDecimalIndex + 1) + value.slice(firstDecimalIndex + 1).replace(/\./g, '')
  }

  if (value.includes('.')) {
    const [integer, decimalPlaces] = value.split('.')
    if (decimalPlaces === null || !decimalPlaces) return value

    if (decimalPlaces.length > 2) {
      value = `${integer}.${decimalPlaces.slice(0, 2)}`
    }
  }

  return value
}

export function formatCryptoQuantity(quantity: number): string {
  if (!Number.isFinite(quantity) || quantity < 0) return '—'

  if (quantity === 0) return '0'

  if (quantity < 0.00000001) return '<0.00000001' //very small numbers show something

  return quantity.toFixed(8).replace(/\.?0+$/, '')
}
