<script setup lang="ts">
import type { AssetSymbol } from '@/types/allocation'
import { parsePercentage } from '@/utils/allocation'
import { computed } from 'vue'

const props = defineProps<{
  primaryPercent: number
  primaryAsset: { symbol: AssetSymbol; name: string }
  secondaryAsset: { symbol: AssetSymbol; name: string }
}>()
const emit = defineEmits<{ 'update:primaryPercent': [value: number] }>()

const secondaryPercent = computed(() => 100 - props.primaryPercent)

function handleSlide(event: Event): void {
  const el = event.target as HTMLInputElement
  emit('update:primaryPercent', Number(el.value))
}

function handlePercentInput(event: Event, isSecondary = false): void {
  const el = event.target as HTMLInputElement
  const value = el.value.replace(/\D/g, '')
  el.value = value

  const parsed = parsePercentage(value)
  if (parsed !== null) emit('update:primaryPercent', isSecondary ? 100 - parsed : parsed)
}

function handlePercentBlur(event: Event, percent: number): void {
  const el = event.target as HTMLInputElement
  el.value = String(percent)
}
</script>

<template>
  <div class="allocation-slider">
    <div class="header">
      <h2>Allocation</h2>
      <div>Adjust how allocation is split</div>
    </div>

    <input
      id="percent-slider"
      class="percent-slider"
      type="range"
      min="0"
      max="100"
      step="1"
      :value="primaryPercent"
      :style="{ '--split': `${primaryPercent}%` }"
      :aria-label="`${primaryAsset.name} allocation percentage`"
      @input="handleSlide"
    />
    <div class="slider-labels">
      <div class="asset-label">
        <span class="label-dot primary-asset"></span>
        <label class="asset-percent" for="primary-percent">{{ primaryAsset.symbol }}</label>
        <div class="percent-field">
          <input
            id="primary-percent"
            class="percent-input"
            type="text"
            inputmode="numeric"
            maxlength="3"
            :aria-label="`${primaryAsset.symbol} allocation percent`"
            :value="primaryPercent"
            @input="handlePercentInput($event)"
            @blur="handlePercentBlur($event, primaryPercent)"
          />
          <span aria-hidden="true">%</span>
        </div>
      </div>
      <div class="asset-label">
        <span class="label-dot secondary-asset"></span>
        <label class="asset-percent" for="secondary-percent">{{ secondaryAsset.symbol }}</label>
        <div class="percent-field">
          <input
            id="secondary-percent"
            class="percent-input"
            type="text"
            inputmode="numeric"
            maxlength="3"
            :aria-label="`${secondaryAsset.symbol} allocation percent`"
            :value="secondaryPercent"
            @input="handlePercentInput($event, true)"
            @blur="handlePercentBlur($event, secondaryPercent)"
          />
          <span aria-hidden="true">%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.allocation-slider {
  margin: 32px 0;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 14px;
    }
  }
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.asset-label {
  display: flex;
  align-items: center;
  gap: 8px;

  .label-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;

    &.primary-asset {
      background-color: #f59e0b;
    }

    &.secondary-asset {
      background-color: #6366f1;
    }
  }
}

.percent-slider {
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 6px;
  background: linear-gradient(to right, #f59e0b var(--split), #6366f1 var(--split));
  cursor: pointer;
}

.percent-slider::-webkit-slider-thumb {
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #dedfe2;
}

.percent-slider::-moz-range-thumb {
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #dedfe2;
}

.percent-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

.percent-input {
  width: 52px;
  padding: 6px;
  border: 1px solid #dedfe2;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 700;
  text-align: right;

  &:focus-visible {
    outline: 2px solid #222222;
  }
}
</style>
