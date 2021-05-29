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
    <input
      class="counter-input-field"
      :value="modelValue"
      type="number"
      @change="updateValue($event.target.value)"
    >
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
import { QBtn } from 'quasar'


export default defineComponent({
  name: 'CounterInput',
  components: {
    QBtn,
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
    openSidebar() {
      uiStore.openSidebar()
    },
    updateValue(value: any) {
      const parsedValue = parseInt(value)
      if (parsedValue) {
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
  width: 3rem;
  margin: 0 1rem;
  font-size: 1rem;
  border: 1px solid;
  font-weight: bold;
  text-align: center;
  padding: 0.5rem;
}

.counter-button {
  width: 2rem;
  height: 2rem;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
  -moz-appearance: textfield; /* Firefox */
}

</style>
