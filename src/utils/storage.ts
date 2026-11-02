import type { SavedInputs } from '@/types/allocation'

const STORAGE_KEY = 'assect-allocation-inputs'

export function saveInputs(inputValues: SavedInputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputValues))
  } catch {}
}

export function loadInputs(): SavedInputs | null {
  try {
    const storedInputs = localStorage.getItem(STORAGE_KEY)

    if (!storedInputs) return null

    const data: SavedInputs = JSON.parse(storedInputs)

    return {
      amount: data.amount,
      currency: data.currency,
      primaryPercent: data.primaryPercent,
    } as SavedInputs
  } catch {
    return null
  }
}
