<script setup lang="ts">
import { computed } from 'vue'
import { type AssetAllocation, type Currency } from '@/types/allocation'
import { formatCryptoQuantity, formatCurrency, formatPercent } from '@/utils/formatting'

const props = defineProps<{
  asset: AssetAllocation
  currency: Currency
}>()

const quantityDisplay = computed(() => {
  if (props.asset.fiatAmount === null) return `0 ${props.asset.symbol}`
  if (props.asset.cryptoQuantity === null) return 'waiting for rates'
  return `${formatCryptoQuantity(props.asset.cryptoQuantity)} ${props.asset.symbol}`
})

const fiatDisplay = computed(() => formatCurrency(props.asset.fiatAmount ?? 0, props.currency))
</script>

<template>
  <div class="asset-card">
    <div class="header">
      <div class="asset-info">
        <div class="asset-icon">
          <img
            :src="`/icons/${asset.symbol.toLowerCase()}.svg`"
            width="36"
            height="36"
            loading="lazy"
            :alt="asset.name"
          />
        </div>
        <div>
          <h2 class="asset-title">
            {{ asset.name }} <span class="symbol">({{ asset.symbol }})</span>
          </h2>
          <div class="asset-subtitle">{{ formatPercent(asset.percentage) }} of total amount</div>
        </div>
      </div>
    </div>

    <div class="asset-values">
      <div class="asset-quantity" :class="{ fetching: asset.cryptoQuantity === null }">
        {{ quantityDisplay }}
      </div>
      <div class="asset-fiat">{{ fiatDisplay }}</div>
    </div>
  </div>
</template>

<style scoped>
.asset-card {
  border: 1px solid #dedfe2;
  border-radius: 8px;
  padding: 24px;
  height: 100%;

  .header {
    display: flex;
    justify-content: space-between;
    gap: 12px;

    .asset-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .asset-icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid #dedfe2;
  }

  .asset-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;

    .symbol {
      color: #5b616e;
    }
  }

  .asset-subtitle {
    font-size: 14px;
    color: #5b616e;
  }

  .asset-values {
    margin-top: 18px;
    padding-left: 49px;
  }

  .asset-quantity {
    font-size: 24px;
    font-weight: 700;

    &.fetching {
      color: #5b616e;
    }
  }

  .asset-fiat {
    color: #5b616e;
  }
}

@media (max-width: 720px) {
  .asset-card .asset-values {
    padding-left: 0;
  }
}
</style>
