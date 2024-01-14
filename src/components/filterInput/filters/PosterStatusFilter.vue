<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { PosterStatus, posterStatusOptions } from 'src/api/model/PosterDto'

const ALL_STATES = 'all_states'

interface Props {
  modelValue?: PosterStatus | typeof ALL_STATES
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ALL_STATES
})

interface Emits {
  (e: 'update:modelValue', modelValue: string | undefined): void
}
const emit = defineEmits<Emits>()

const extendedOptions = computed(() => {
  return [
    {
      key: ALL_STATES,
      label: 'Alle Status'
    },
    ...posterStatusOptions
  ]
})

function updateModelValue(value: string) {
  emit('update:modelValue', value !== ALL_STATES ? value : undefined)
}
</script>
<template>
  <FilterInput
    label="Plakat Status"
    :model-value="props.modelValue"
    @update:model-value="updateModelValue"
    :options="extendedOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
