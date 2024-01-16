<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'

interface Props {
  options: StateAssociationDto[]
  modelValue?: number
  showAllStateAssociation?: boolean
  disable?: boolean
  label?: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  showAllStateAssociation: true,
  disable: false,
  label: 'Landesverbände'
})

interface Emits {
  (e: 'update:modelValue', value: number | undefined): void
}
const emit = defineEmits<Emits>()

const extendedOptions = computed(() => {
  if (props.showAllStateAssociation) {
    return [
      {
        id: 0,
        name: 'Alle Landesverbände'
      },
      ...props.options
    ]
  } else {
    return props.options
  }
})

function updateModelValue(value: number) {
  emit('update:modelValue', value > 0 ? value : undefined)
}
</script>

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
