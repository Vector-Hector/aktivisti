<template>
  <FilterInput
    label="Kampagnen"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    :options="extendedOptions"
    emit-value
    map-options
    option-value="id"
    option-label="name"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { CampaignDto } from 'src/api/model/CampaignDto'

export default defineComponent({
  name: 'CampaignFilter',
  components: {
    FilterInput
  },
  props: {
    options: {
      type: Array as PropType<CampaignDto[]>,
      required: true
    },
    modelValue: {
      type: Number as PropType<number>,
      default: 0
    }
  },
  emits: ['update:modelValue'],
  computed: {
    extendedOptions(): Partial<CampaignDto>[] {
      return [
        {
          id: 0,
          name: 'Alle Kampagnen'
        },
        ...this.options
      ]
    }
  },
  methods: {
    updateModelValue(value: number) {
      this.$emit('update:modelValue', value > 0 ? value : undefined)
    }
  }
})
</script>
