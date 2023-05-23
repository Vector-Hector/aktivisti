<template>
  <FilterInput
    label="Aktionen erstellt von"
    :model-value="selectedOwnership"
    emit-value
    @update:model-value="updateModelValue"
    :options="ownershipOptions"
    map-options
    option-value="key"
    option-label="label"
  />
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'

enum Ownership {
  ME,
  OTHER,
  ALL
}

const ownershipOptions: { key: Ownership; label: string }[] = [
  {
    label: 'Mir',
    key: Ownership.ME
  },
  {
    label: 'Anderen',
    key: Ownership.OTHER
  },
  {
    label: 'Allen',
    key: Ownership.ALL
  }
]

export default defineComponent({
  name: 'OwnershipFilter',
  components: {
    FilterInput
  },
  props: {
    modelValue: {
      type: Boolean as PropType<boolean>
    }
  },
  computed: {
    selectedOwnership() {
      if (this.modelValue) {
        return Ownership.ME
      } else if (this.modelValue === false) {
        return Ownership.OTHER
      } else {
        return Ownership.ALL
      }
    }
  },
  data() {
    return {
      ownershipOptions
    }
  },
  emits: ['update:modelValue'],
  methods: {
    updateModelValue(value: Ownership) {
      if (value === Ownership.ME) {
        this.$emit('update:modelValue', true)
      } else if (value === Ownership.OTHER) {
        this.$emit('update:modelValue', false)
      } else {
        this.$emit('update:modelValue', undefined)
      }
    }
  }
})
</script>
