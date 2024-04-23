<script setup lang="ts">
import FilterInput from 'components/filterInput/FilterInput.vue'
import { EventStatus, eventStatusOptions } from 'src/api/model/EventStatus'

interface Props {
  modelValue?: EventStatus
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: EventStatus): void
}
const emit = defineEmits<Emits>()
</script>

<template>
  <FilterInput
    label="Status"
    :model-value="props.modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    :options="eventStatusOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
