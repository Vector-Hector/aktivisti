<template>
  <div class="labeled-button">
    <slot name="btn">
      <QBtn v-bind="$props" />
    </slot>
    <div class="button-label">
      {{ $props.externalLabel }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QBtn } from 'quasar'
//@ts-ignore
import { useBtnProps } from 'quasar/src/components/btn/use-btn.js'

export default defineComponent({
  name: 'LabeledBtn',
  props: {
    ...useBtnProps,
    externalLabel: {
      type: String as PropType<string>,
      required: false
    }
  },
  components: {
    QBtn
  }
})
</script>
<style lang="scss" scoped>
.labeled-button {
  text-align: center;
  flex-direction: column;
}
</style>
