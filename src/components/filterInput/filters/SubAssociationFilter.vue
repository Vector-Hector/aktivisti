<script setup lang="ts">
import { computed } from 'vue'
import FilterInput from 'components/filterInput/FilterInput.vue'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  options: SubAssociationDto[]
  modelValue?: number
  showAllSubAssociation?: boolean
  disable?: boolean
  label?: string
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  showAllCampaigns: true,
  disable: false
})

interface Emits {
  (e: 'update:modelValue', value: number | undefined): void
}
const emit = defineEmits<Emits>()

const label = props.label ? props.label : t('subAssociationFilter.defaultLabel')

const extendedOptions = computed(() => {
  if (props.showAllSubAssociation) {
    return [
      {
        id: 0,
        name: t('subAssociationFilter.showAllSubAssociations')
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
