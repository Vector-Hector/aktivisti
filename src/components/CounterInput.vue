<template>
  <div class="counter-input">
    <IonFabButton
      class="counter-button"
      :disabled="modelValue <= 0"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <IonIcon name="remove" />
    </IonFabButton>
    <input
      class="counter-input-field"
      :value="modelValue"
      type="number"
      @change="updateValue($event.target.value)"
    >
    <IonFabButton
      class="counter-button"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      <IonIcon name="add" />
    </IonFabButton>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { uiStore } from 'src/store/UiStore'
import { IonFabButton, IonIcon } from '@ionic/vue'
import { addIcons } from 'ionicons'
import { remove, add } from 'ionicons/icons'

addIcons({
  remove,
  add
})

export default defineComponent({
  name: 'CounterInput',
  components: {
    IonIcon,
    IonFabButton
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
    return {}
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
    -moz-appearance:textfield; /* Firefox */
}

</style>
