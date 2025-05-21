<script setup lang="ts">
import { ionAdd, ionRemove } from '@quasar/extras/ionicons-v5'
import { QBtn, QInput } from 'quasar'

interface Props {
  modelValue?: number
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: 0
})

interface Emits {
  (e: 'update:modelValue', value: number): void
}
const emit = defineEmits<Emits>()

function updateValue(value: any) {
  const parsedValue = parseInt(value)
  if (!isNaN(parsedValue) && parsedValue >= 0) {
    emit('update:modelValue', parsedValue)
  }
}
</script>
<template>
  <div class="counter-input">
    <QBtn
      fab-mini
      :icon="ionRemove"
      color="primary"
      class="counter-button"
      :disabled="props.modelValue <= 0"
      @click="updateValue(props.modelValue - 1)"
    />
    <QInput
      class="counter-input-field"
      square
      dense
      outlined
      :counter="false"
      :model-value="props.modelValue"
      min="0"
      type="number"
      @update:model-value="updateValue($event)"
    />
    <QBtn
      fab-mini
      :icon="ionAdd"
      color="primary"
      class="counter-button"
      @click="updateValue(modelValue + 1)"
    />
  </div>
</template>

<style lang="scss" scoped>
.counter-input {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.counter-input-field {
  width: 4rem;
  margin: 0 1rem;
  :deep(input) {
    padding: 0;
    font-size: 1.3rem;
    text-align: center;
    font-weight: bold;
  }
}

.counter-button {
  width: 2rem;
  height: 2rem;
}

:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

:deep(input[type='number']) {
  -moz-appearance: textfield; /* Firefox */
}
</style>
