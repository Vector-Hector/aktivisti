<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { CampaignDto } from 'src/api/model/CampaignDto'

interface Props {
  options: CampaignDto[]
  modelValue?: number
  showAllCampaigns?: boolean
  disable?: boolean
  label?: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  showAllCampaigns: true,
  disable: false,
  label: 'Kampagnen'
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
        name: 'Alle Kampagnen'
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
