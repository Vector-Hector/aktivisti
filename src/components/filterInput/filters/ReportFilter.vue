<script setup lang="ts">
import { defineEmits, defineProps, withDefaults } from 'vue'
import {
  ReportType,
  ReportTypeOption,
  reportTypeOptions
} from 'src/api/model/ReportType'
import FilterInput from 'components/filterInput/FilterInput.vue'

interface Props {
  modelValue?: ReportTypeOption
}

interface Emits {
  (e: 'update:modelValue', reportType: ReportType): void
}

const emit = defineEmits<Emits>()
const props = withDefaults(defineProps<Props>(), {
  modelValue:  () => reportTypeOptions[0]
})


function updateModelValue(reportType: ReportType) {
  emit('update:modelValue', reportType)
}


</script>
<template>
  <FilterInput
    label="Typ"
    :model-value="props.modelValue"
    @update:model-value="updateModelValue"
    :options="reportTypeOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
