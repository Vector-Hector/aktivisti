<template>
  <IonRow>
    <IonCol
      class="label-wrapper"
      size="12"
      size-sm="6"
      size-md="4"
    >
      {{ label }}
    </IonCol>
    <IonCol>
      <CounterInput
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </IonCol>
  </IonRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonCol, IonRow } from '@ionic/vue'
import { addIcons } from 'ionicons'
import { remove, add } from 'ionicons/icons'
import CounterInput from '@/components/CounterInput.vue'

addIcons({
  remove,
  add
})

export default defineComponent({
  name: 'MetricsRow',
  components: {
    IonRow,
    IonCol,
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
@import "~@/scss/_variables.scss";

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

.label-wrapper {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1rem;
}

@media only screen and (max-width: $breakpoint-sm) {
  .label-wrapper {
    justify-content: center;
  }
}
</style>
