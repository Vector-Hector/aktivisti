<template>
  <div class="row q-col-gutter-y-sm">
      <div class="col-12 col-sm-6 col-md-4 label-col">
        <div class="label">{{ label }}</div>
      </div>
      <div class="col-12 col-sm-6 col-md-8">
        <CounterInput
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import CounterInput from 'src/components/CounterInput.vue'


export default defineComponent({
  name: 'MetricsRow',
  components: {
    CounterInput
  },
  props: {
    modelValue: {
      type: Number as PropType<number>,
      default: 0
    },
    label: {
      type: String as PropType<string>,
      required: true
    }
  },
  emits: ['update:modelValue']
})
</script>

<style lang="scss" scoped>
@import "src/css/_variables.scss";

.counter-input {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.counter-input-field {
  width: 5rem;
  margin: 0 1rem;
  font-size: 1.6rem;
  border: 1px solid;
  font-weight: bold;
  text-align: center;
  padding: 1rem 1rem;
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

.label-col {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.label {
  font-weight: bold;
}
</style>
