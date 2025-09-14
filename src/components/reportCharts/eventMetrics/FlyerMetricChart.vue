<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import EventMetricChart from 'components/reportCharts/eventMetrics/EventMetricChart.vue'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventTypes } from 'src/api/model/EventTypes'
import { apiClient } from 'src/api/ApiClient'
import { ReportType, useReportType } from 'src/api/model/ReportType'

interface Props {
  campaignId: number
  stateAssociationId?: number
  subAssociationId?: number
}

const props = defineProps<Props>()
const { ReportTypeUtil } = useReportType()

const metricsFlyer = ref<EventMetricDto[] | null>(null)

onBeforeMount(async () => {
  metricsFlyer.value = await fetchEventMetric(EventTypes.FLYERS)
})

async function fetchEventMetric(eventType: EventTypes) {
  return (await apiClient.eventMetrics.list({ available_for_types: eventType }))
    .payload.data
}
</script>
<template>
  <EventMetricChart
    :campaignId="props.campaignId"
    :stateAssociationId="props.stateAssociationId"
    :subAssociationId="props.subAssociationId"
    :eventMetrics="metricsFlyer"
    :title="ReportTypeUtil.getLabel(ReportType.METRICS_FLYER)"
  />
</template>
