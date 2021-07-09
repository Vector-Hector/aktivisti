<template>
  <QCheckbox
    :model-value="checked"
    @update:model-value="$emit('update:checked', $event)"
    :label="name"
  />
  <div class="target-input-container" v-if="checked">
    <div class="guideline"></div>
    <QInput
      filled
      dense
      bg-color="white"
      class="target-input"
      type="number"
      :placeholder="'Zielvorgabe ' + name"
      :model-value="target"
      @update:model-value="$emit('update:target', parseInt($event))"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QCheckbox, QInput } from 'quasar'

export default defineComponent({
  name: 'MetricInput',
  components: {
    QInput,
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
    },
    target: {
      type: Number as PropType<number>,
      default: 0
    }
  },
  emits: ['update:checked', 'update:target']
})
</script>
<style lang="scss" scoped>
.target-input-container {
  display: flex;
  flex-direction: row;
  padding: 0.2rem 1rem 1rem 1rem;
}

.guideline {
  margin: -.1rem 0.5rem 0 0.2rem;
  display: block;
  width: .7rem;
  height: 1.4rem;
  border-left: 1px solid $grey-8;
  border-bottom: 1px solid $grey-9;
}

.target-input {
  flex: 1;
}
</style>
