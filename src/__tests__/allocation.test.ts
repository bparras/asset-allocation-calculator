import {
  calculateCryptoQuantity,
  parseFiatAmount,
  parsePercentage,
  splitFiatAmount,
} from '@/utils/allocation'
import { formatCurrecyInput } from '@/utils/formatting'
import { describe, expect, it } from 'vitest'

describe('allocation split calculations', () => {
  it('splits 1000 amount with 70/30 split and calculates crypto quantity', () => {
    expect(splitFiatAmount(1000, 70)).toEqual({ primaryFiat: 700, secondaryFiat: 300 })
    expect(calculateCryptoQuantity(700, 0.00001)).toBeCloseTo(0.007)
  })

  it('keeps the allocated amounts equal to the investment', () => {
    const { primaryFiat, secondaryFiat } = splitFiatAmount(0.05, 50)

    expect(primaryFiat).toBe(0.03)
    expect(secondaryFiat).toBe(0.02)
    expect(primaryFiat + secondaryFiat).toBe(0.05)
  })

  it.each([
    [20.15, 50, 10.08, 10.07],
    [10.5, 55, 5.78, 4.72],
  ])('rounds an exact half cent up: %d at %d%%', (total, percent, primary, secondary) => {
    expect(splitFiatAmount(total, percent)).toEqual({
      primaryFiat: primary,
      secondaryFiat: secondary,
    })
  })
})

describe('parseFiatAmount', () => {
  it.each([
    ['1000', 1000],
    ['1000.5', 1000.5],
    ['.5', 0.5],
    ['1000000000', 1000000000],
  ])('accepts %s', (input, expected) => {
    expect(parseFiatAmount(input)).toBe(expected)
  })

  it.each(['1000000000.01', '1.234', '1000.5555', 'abc', ''])('rejects "%s"', (input) => {
    expect(parseFiatAmount(input)).toBeNull()
  })
})

describe('formatCurrecyInput', () => {
  it('removes commas and letters', () => {
    expect(formatCurrecyInput('1,000.50')).toBe('1000.50')
    expect(formatCurrecyInput('abc')).toBe('')
  })

  it('limits decimals and repeated points', () => {
    expect(formatCurrecyInput('1.2.345')).toBe('1.23')
  })
})

describe('parsePercentage', () => {
  it.each([
    ['0', 0],
    ['55', 55],
    ['100', 100],
  ])('accepts %s', (input, expected) => {
    expect(parsePercentage(input)).toBe(expected)
  })

  it.each(['101', '50.5', '-1', 'abc', ''])('rejects "%s"', (input) => {
    expect(parsePercentage(input)).toBeNull()
  })
})
