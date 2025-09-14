<script setup lang="ts">
import { ReportType, useReportType } from 'src/api/model/ReportType'
import FilterInput from 'components/filterInput/FilterInput.vue'

const { reportTypeOptions } = useReportType()

interface Props {
  modelValue?: ReportType
}

interface Emits {
  (e: 'update:modelValue', reportType: ReportType): void
}

const emit = defineEmits<Emits>()
const props = defineProps<Props>()

function updateModelValue(reportType: ReportType) {
  emit('update:modelValue', reportType)
}
</script>
<template>
  <FilterInput
    :label="$t('reports.selectReportDialog.type')"
    :model-value="props.modelValue"
    @update:model-value="updateModelValue"
    :options="reportTypeOptions"
    emit-value
    map-options
    option-value="key"
    option-label="label"
  />
</template>
