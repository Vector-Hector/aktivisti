<script setup lang="ts">
import { PropType } from 'vue'
import { QBtn } from 'quasar'
import { useBtnProps } from 'quasar/src/components/btn/use-btn.js'

// TODO(peter) Use `interface Props` style
const props = defineProps({
  ...useBtnProps,
  externalLabel: {
    type: String as PropType<string>,
    required: false
  }
})
</script>
<template>
  <div class="labeled-button">
    <slot name="btn">
      <QBtn v-bind="$props" />
    </slot>
    <div class="button-label">
      {{ props.externalLabel }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
.labeled-button {
  text-align: center;
  flex-direction: column;
}
</style>
