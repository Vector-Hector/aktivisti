<script setup lang="ts">
import FilterInput from 'components/filterInput/FilterInput.vue'
import { EventStatus, useEventStatus } from 'src/api/model/EventStatus'

interface Props {
  modelValue?: EventStatus
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: EventStatus): void
}
const emit = defineEmits<Emits>()

const { eventStatusOptions } = useEventStatus()
</script>

<template>
  <FilterInput
    :label="$t('eventStatusFilter.defaultLabel')"
    :model-value="props.modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    :options="eventStatusOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
