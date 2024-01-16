<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

interface Props {
  options: SubAssociationDto[]
  modelValue?: number
  showAllCampaigns?: boolean
  disable?: boolean
  label?: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  showAllCampaigns: true,
  disable: false,
  label: 'Bezirks/Kreisverband'
})

interface Emits {
  (e: 'update:modelValue', value: number | undefined): void
}
const emit = defineEmits<Emits>()

const extendedOptions = computed(() => {
  if (props.showAllCampaigns) {
    return [
      {
        id: 0,
        name: 'Alle Bezirks/Kreisverbände'
      },
      ...props.options
    ]
  } else {
    return props.options
  }
})

function updateModelValue(value: number) {
  emit('update:modelValue', value > 0 ? value : undefined)
}
</script>
<template>
  <FilterInput
    :label="label"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    :options="extendedOptions"
    emit-value
    map-options
    option-value="id"
    option-label="name"
    :disable="disable"
  />
</template>
