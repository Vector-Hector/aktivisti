<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'

export default defineComponent({
  name: 'EventTypeFilter',
  components: {
    FilterInput
  },
  props: {
    modelValue: {
      type: String as PropType<EventTypes>
    },
    availableEventTypes: {
      type: Array as PropType<EventTypes[]>,
      default: () => Object.values(EventTypes)
    }
  },
  computed: {
    eventTypeOptions() {
      return eventTypeOptions.filter((item) =>
        this.availableEventTypes.includes(item.key)
      )
    }
  },
  emits: ['update:modelValue']
})
</script>

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
