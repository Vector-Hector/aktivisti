<template>
  <QCheckbox
    :model-value="checked"
    @update:model-value="$emit('update:checked', $event)"
    :label="name"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QCheckbox } from 'quasar'

export default defineComponent({
  name: 'MetricInput',
  components: {
    QCheckbox
  },
  props: {
    name: {
      type: String as PropType<string>,
      required: false
    },
    checked: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ['update:checked']
})
</script>
<style lang="scss" scoped>
.guideline {
  margin: -0.1rem 0.5rem 0 0.2rem;
  display: block;
  width: 0.7rem;
  height: 1.4rem;
  border-left: 1px solid $grey-8;
  border-bottom: 1px solid $grey-9;
}
</style>
