<template>
  <div class="counter-input">
    <QBtn
      fab-mini
      :icon="ionRemove"
      color="primary"
      class="counter-button"
      :disabled="modelValue <= 0"
      @click="$emit('update:modelValue', modelValue - 1)"
    />
    <QInput
      class="counter-input-field"
      square
      dense
      outlined
      :counter="false"
      :model-value="modelValue"
      min="0"
      type="number"
      @update:model-value="updateValue($event)"
    />
    <QBtn
      fab-mini
      :icon="ionAdd"
      color="primary"
      class="counter-button"
      @click="$emit('update:modelValue', modelValue + 1)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { uiStore } from 'src/store/UiStore'
import { ionAdd, ionRemove } from '@quasar/extras/ionicons-v5'
import { QBtn, QInput } from 'quasar'

export default defineComponent({
  name: 'CounterInput',
  components: {
    QBtn,
    QInput
  },
  props: {
    modelValue: {
      type: Number as PropType<number>,
      default: 0
    },
    showSidebar: {
      type: Boolean as PropType<boolean>,
      default: true
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      ionRemove,
      ionAdd
    }
  },
  methods: {
    toggleSidebar() {
      uiStore.toggleSidebar()
    },
    updateValue(value: any) {
      const parsedValue = parseInt(value)
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        this.$emit('update:modelValue', parsedValue)
      }
    }
  }
})
</script>

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
