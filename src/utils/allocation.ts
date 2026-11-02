const MAX_FIAT_AMOUNT = 1000000000

export function splitFiatAmount(
  total: number,
  primaryPercent: number,
): { primaryFiat: number; secondaryFiat: number } {
  const totalCents = Math.round(total * 100)
  const primaryCents = Math.round((totalCents * primaryPercent) / 100)

  return {
    primaryFiat: primaryCents / 100,
    secondaryFiat: (totalCents - primaryCents) / 100,
  }
}

export function calculateCryptoQuantity(fiatAmount: number, unitsPerFiat: number): number {
  return fiatAmount * unitsPerFiat
}

//even though we have input formatting, need this to check for value errors if value was set elsewhere
export function parseFiatAmount(value: string | number): number | null {
  const input = String(value).trim()

  //check 2 decimals
  if (!/^(?:\d+(\.\d{0,2})?|\.\d{1,2})$/.test(input)) {
    return null
  }

  const amount = Number(input)

  if (!Number.isFinite(amount) || amount > MAX_FIAT_AMOUNT) return null

  return amount
}

export function parsePercentage(value: string): number | null {
  if (!/^\d{1,3}$/.test(value)) return null
  const percent = Number(value)

  return percent <= 100 ? percent : null
}
