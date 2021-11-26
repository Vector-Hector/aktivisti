<template>
  <FilterInput
    label="Status"
    :model-value="modelValue"
    @update:model-value="(value)=>this.$emit('update:modelValue', value)"
    :options="eventStatusOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { EventStatus, eventStatusOptions } from 'src/api/model/EventStatus'

export default defineComponent({
  name: 'EventStatusFilter',
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
      eventStatusOptions
    }
  },
  emits: ['update:modelValue'],
})
</script>
