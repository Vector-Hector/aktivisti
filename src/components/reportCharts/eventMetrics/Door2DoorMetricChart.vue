<script setup lang="ts">
import EventMetricChart from 'components/reportCharts/eventMetrics/EventMetricChart.vue'
import { onBeforeMount, ref } from 'vue'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventTypes } from 'src/api/model/EventTypes'
import { apiClient } from 'src/api/ApiClient'

interface Props {
  campaignId: number
  stateAssociationId?: number
  subAssociationId?: number
}

const props = defineProps<Props>()

const metricsDoor2Door = ref<EventMetricDto[] | null>(null)

onBeforeMount(async () => {
  metricsDoor2Door.value = await fetchEventMetric(EventTypes.DOOR_TO_DOOR)
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
    :eventMetrics="metricsDoor2Door"
    title="Haustürgespräche"
  />
</template>
