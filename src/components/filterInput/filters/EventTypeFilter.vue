<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { EventTypes, useEventTypes } from 'src/api/model/EventTypes'

interface Props {
  modelValue?: EventTypes
  availableEventTypes?: EventTypes[]
}
const props = withDefaults(defineProps<Props>(), {
  availableEventTypes: () => Object.values(EventTypes)
})

interface Emits {
  (e: 'update:modelValue', value: any): void
}
const emit = defineEmits<Emits>()

const { eventTypeOptions } = useEventTypes()

const possibleEventTypeOptions = computed(() => {
  return eventTypeOptions.filter((item) =>
    props.availableEventTypes.includes(item.key)
  )
})
</script>

<template>
  <FilterInput
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    input-debounce="0"
    :label="$t('eventTypeFilter.defaultLabel')"
    :options="possibleEventTypeOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
    clearable
  />
</template>
