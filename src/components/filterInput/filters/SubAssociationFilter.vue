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
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'

export default defineComponent({
  name: 'SubAssociationFilter',
  components: {
    FilterInput
  },
  props: {
    options: {
      type: Array as PropType<SubAssociationDto[]>,
      required: true
    },
    modelValue: {
      type: Number as PropType<number>,
      default: 0
    },
    showAllCampaigns: {
      type: Boolean,
      default: true
    },
    disable: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Bezirks/Kreisverband'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    extendedOptions(): Partial<SubAssociationDto>[] {
      if (this.showAllCampaigns) {
        return [
          {
            id: 0,
            name: 'Alle Bezirks/Kreisverbände'
          },
          ...this.options
        ]
      } else {
        return this.options
      }
    }
  },
  methods: {
    updateModelValue(value: number) {
      this.$emit('update:modelValue', value > 0 ? value : undefined)
    }
  }
})
</script>
