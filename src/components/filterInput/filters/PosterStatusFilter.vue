<template>
  <FilterInput
    label="Plakat Status"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    :options="extendedOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { PosterStatus, posterStatusOptions } from 'src/api/model/PosterDto'

const ALL_STATES = 'all_states'

export default defineComponent({
  name: 'PosterStatusFilter',
  components: { FilterInput },
  props: {
    modelValue: {
      type: String as PropType<PosterStatus>,
      default: ALL_STATES
    }
  },
  data() {
    return {
      posterStatusOptions
    }
  },
  emits: ['update:modelValue'],
  computed: {
    extendedOptions(): { key: string; label: string }[] {
      return [
        {
          key: ALL_STATES,
          label: 'Alle Status'
        },
        ...posterStatusOptions
      ]
    }
  },
  methods: {
    updateModelValue(value: string) {
      this.$emit('update:modelValue', value !== ALL_STATES ? value : undefined)
    }
  }
})
</script>
