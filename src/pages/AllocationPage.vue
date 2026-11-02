<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AssetCard from '@/components/AssetCard.vue'
import { ASSETS, type AssetAllocation, type Currency, type SavedInputs } from '@/types/allocation'
import { calculateCryptoQuantity, parseFiatAmount, splitFiatAmount } from '@/utils/allocation'
import { loadInputs, saveInputs } from '@/utils/storage'
import { useExchangeRates } from '@/composables/useExchangeRates'
import { formatCurrecyInput } from '@/utils/formatting'
import AllocationSlider from '@/components/AllocationSlider.vue'

const DEFAULT_INPUTS: SavedInputs = {
  amount: '',
  currency: 'USD',
  primaryPercent: 70,
}

const saved = loadInputs() ?? DEFAULT_INPUTS
const amount = ref<string>(saved.amount)
const currency = ref<Currency>(saved.currency)
const primaryPercent = ref(saved.primaryPercent)

const { rates, isLoading, ratesError, ratesUpdatedAt, refreshRates } = useExchangeRates(currency)

const totalAmount = computed(() => (amount.value === '' ? null : parseFiatAmount(amount.value)))
const amountError = computed(() =>
  amount.value !== '' && totalAmount.value === null ? 'Enter amount up to 1 billion' : null,
)

const lastUpdated = computed(() =>
  ratesUpdatedAt.value === null
    ? ''
    : new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(ratesUpdatedAt.value)),
)

//primary fiat is selected percentage, second receives the remaining to avoid rounding/precision differences
const assets = computed<AssetAllocation[]>(() => {
  const total = totalAmount.value
  const split = total === null ? null : splitFiatAmount(total, primaryPercent.value)

  return ASSETS.map((asset, index) => {
    const percentage = index === 0 ? primaryPercent.value : 100 - primaryPercent.value
    const fiatAmount = split === null ? null : index === 0 ? split.primaryFiat : split.secondaryFiat

    const exchangeRate = rates.value?.[asset.symbol] ?? null
    const cryptoQuantity =
      fiatAmount !== null && exchangeRate !== null
        ? calculateCryptoQuantity(fiatAmount, exchangeRate)
        : null

    return {
      ...asset,
      percentage,
      fiatAmount,
      exchangeRate,
      cryptoQuantity,
    } as AssetAllocation
  })
})

watch([amount, currency, primaryPercent], () => {
  saveInputs({
    amount: amount.value,
    currency: currency.value,
    primaryPercent: primaryPercent.value,
  })
})

function handleAmountInput(event: Event) {
  const el = event.target as HTMLInputElement
  const value = el.value
  const formattedValue = formatCurrecyInput(value)

  el.value = formattedValue //need this since state doesnt trigger
  amount.value = formattedValue
}

function handleAmountBlur(): void {
  if (amount.value === '') return

  const value = Number(amount.value)

  if (amount.value === '.' || !Number.isFinite(value)) {
    amount.value = ''
    return
  }

  amount.value = value.toFixed(2)
}
</script>

<template>
  <main class="container">
    <div class="panel">
      <header class="header">
        <h1>Asset Allocation Calculator</h1>
      </header>

      <section class="investment-input">
        <div class="input-group">
          <label class="input-label" for="amount">Investment amount</label>
          <div class="amount-row">
            <input
              id="amount"
              :value="amount"
              @input="handleAmountInput"
              @blur="handleAmountBlur"
              class="input-field"
              type="text"
              inputmode="decimal"
              maxlength="13"
              autocomplete="off"
              placeholder="Enter amount"
              :aria-invalid="amountError !== null"
              :aria-describedby="amountError ? 'amount-error' : 'input-amount-help'"
            />

            <select name="currency" id="currency" aria-label="Currency" v-model="currency">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div id="amount-error" class="field-error" role="alert">{{ amountError }}</div>
          <div id="input-amount-help">Enter amount and choose currency</div>
        </div>

        <AllocationSlider
          :primary-percent="primaryPercent"
          :primary-asset="ASSETS[0]"
          :secondary-asset="ASSETS[1]"
          @update:primary-percent="primaryPercent = $event"
        />
      </section>

      <section class="allocation-distribution" aria-label="Allocation distribution">
        <div class="assets">
          <AssetCard
            v-for="asset in assets"
            :key="asset.symbol"
            :asset="asset"
            :currency="currency"
          />
        </div>
      </section>

      <section class="rate-status">
        <div class="rate-info">
          <span class="rate-error" role="alert">{{
            ratesError !== null ? 'Could not refresh rates' : ''
          }}</span>
          <span v-if="isLoading && !ratesError">Loading exchange rates...</span>
          <span v-else-if="!ratesError">Exchange rates - Last Updated: {{ lastUpdated }}</span>
        </div>

        <button class="button" type="button" @click="refreshRates">Refresh</button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.panel {
  width: min(100%, 700px);
  padding: 24px;
  border: 1px solid #dedfe2;
  border-radius: 8px;
  background-color: #fff;

  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 36px;

    h1 {
      margin: 0;
    }
  }
}

.input-group {
  input[aria-invalid='true'] {
    border-color: #cc0000;
  }

  input {
    font-size: 32px;
    font-weight: 700;
  }
}

.field-error {
  color: #cc0000;
  font-size: 14px;
}

.assets {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
  align-items: start;
}

.rate-status {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  background-color: #f2f4fa;
  padding: 12px;
  border-radius: 8px;
  gap: 12px;
}

.rate-info {
  display: flex;
  align-items: center;
}

.rate-error {
  color: #cc0000;
}

@media (max-width: 720px) {
  .assets {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    margin-top: 28px;
  }
}

@media (max-width: 400px) {
  .panel {
    padding: 16px;
  }
}
</style>
