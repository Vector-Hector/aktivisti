<template>
  <FilterInput
    :model-value="modelValue"
    @update:model-value="(value) => this.$emit('update:modelValue', value)"
    input-debounce="0"
    label="Aktionstyp"
    :options="eventTypeOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
    clearable
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { eventTypeOptions } from 'src/api/model/EventTypes'
import { EventStatus } from 'src/api/model/EventStatus'

export default defineComponent({
  name: 'EventTypeFilter',
  components: {
    FilterInput
  },
  props: {
    modelValue: {
      type: String as PropType<EventStatus>
    }
  },
  data() {
    return {
      eventTypeOptions
    }
  },
  emits: ['update:modelValue']
})
</script>
