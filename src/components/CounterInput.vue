<template>
  <div class="counter-input">
    <IonFabButton
      :disabled="modelValue <= 0"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <IonIcon name="remove" />
    </IonFabButton>
    <input
      class="counter-input-field"
      type="number"
      :value="modelValue"
    >
    <IonFabButton
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      <IonIcon name="add" />
    </IonFabButton>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { uiStore } from '@/store/UiStore'
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
      type: Boolean as PropType<Boolean>,
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
  width: 5rem;
  margin: 0 1rem;
  font-size: 1.6rem;
  border: 1px solid;
  font-weight: bold;
  text-align: center;
  padding: 1rem 1rem;
}

</style>
