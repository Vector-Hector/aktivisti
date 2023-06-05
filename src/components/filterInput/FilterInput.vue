<template>
  <div class="select-wrapper">
    <QSelect
      :dropdownIcon="ionChevronDown"
      :clearIcon="ionClose"
      filled
      :model-value="modelValue"
      v-bind="$attrs"
    >
      <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </QSelect>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { QSelect } from 'quasar'

export default defineComponent({
  name: 'FilterInput',
  components: {
    QSelect
  },
  props: {
    modelValue: {
      type: [Number, String, Array] as PropType<typeof QSelect.$props>
      //  TODO(peter@ctrl.alt.coop) modelValue should be required, but passed modelValue is sometimes undefined
      //  It needs to be checked which passed modelValues are undefined and to fix this.
    }
  },
  data() {
    return {
      ionChevronDown,
      ionClose
    }
  }
})
</script>

<style lang="scss" scoped>
.select-wrapper {
  margin: 0 0 0.5rem 0;
}
</style>
