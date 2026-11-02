import { getExchangeRates } from '@/services/exchangeRatesService'
import type { Currency, ExchangeRates } from '@/types/allocation'
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

export function useExchangeRates(currency: Ref<Currency>) {
  const REFRESH_INTERVAL = 30000
  const rates = ref<ExchangeRates | null>(null)
  const isLoading = ref<boolean>(false)
  const ratesError = ref<string | null>(null)
  const ratesUpdatedAt = ref<number | null>(null)

  let controller: AbortController | null = null
  let intervalId: ReturnType<typeof setInterval>

  onMounted(() => {
    intervalId = setInterval(() => {
      refreshRates()
    }, REFRESH_INTERVAL)
  })

  onUnmounted(() => {
    clearInterval(intervalId)
    controller?.abort()
  })

  watch(
    currency,
    async () => {
      rates.value = null
      ratesUpdatedAt.value = null
      ratesError.value = null
      await refreshRates()
    },
    { immediate: true },
  )

  async function refreshRates(): Promise<void> {
    if (controller) controller.abort()

    const currentController = new AbortController()
    controller = currentController

    //flicker fix
    if (rates.value === null) {
      isLoading.value = true
    }

    try {
      const result = await getExchangeRates(currency.value, currentController.signal)
      if (currentController.signal.aborted) return //prevent stale data from updating rates

      rates.value = result
      ratesUpdatedAt.value = Date.now()
      ratesError.value = null
    } catch (err) {
      if (currentController.signal.aborted) return

      const errorMessage = 'Error loading exchange rates'
      ratesError.value = err instanceof Error ? `${errorMessage}: ${err.message}` : errorMessage
    } finally {
      if (controller === currentController) {
        isLoading.value = false //move here to prevent cancelling switch currency mid-fetch
        controller = null
      }
    }
  }

  return { rates, isLoading, ratesError, ratesUpdatedAt, refreshRates }
}
