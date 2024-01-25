<script setup lang="ts">
import { ionChevronDown, ionClose } from '@quasar/extras/ionicons-v5'
import { QSelect } from 'quasar'

interface Props {
  modelValue?: typeof QSelect.$props
  //  TODO(peter@ctrl.alt.coop) modelValue should be required, but passed modelValue is sometimes undefined
  //  It needs to be checked which passed modelValues are undefined and to fix this.
}
const props = defineProps<Props>()
</script>

<template>
  <QSelect
    :dropdownIcon="ionChevronDown"
    :clearIcon="ionClose"
    filled
    :model-value="props.modelValue"
    v-bind="$attrs"
  >
    <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </QSelect>
</template>
