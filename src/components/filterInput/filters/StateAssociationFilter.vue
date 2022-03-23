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
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'

export default defineComponent({
  name: 'StateAssociationFilter',
  components: {
    FilterInput
  },
  props: {
    options: {
      type: Array as PropType<StateAssociationDto[]>,
      required: true
    },
    modelValue: {
      type: Number as PropType<number>,
      default: 0
    },
    showAllStateAssociation: {
      type: Boolean,
      default: true
    },
    disable: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Landesverbände'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    extendedOptions(): Partial<StateAssociationDto>[] {
      if (this.showAllStateAssociation) {
        return [
          {
            id: 0,
            name: 'Alle Landesverbände'
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
