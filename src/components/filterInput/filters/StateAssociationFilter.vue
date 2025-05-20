<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
  disable: false
})

const label = props.label
  ? props.label
  : t('stateAssociationFilter.defaultLabel')

interface Emits {
  (e: 'update:modelValue', value: number | undefined): void
}
const emit = defineEmits<Emits>()

const extendedOptions = computed(() => {
  if (props.showAllStateAssociation) {
    return [
      {
        id: 0,
        name: t('stateAssociationFilter.showAllStateAssociations')
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
