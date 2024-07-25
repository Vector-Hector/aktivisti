<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  setEvent(event: EventDto): void
  setEventType(type: EventTypes): void
  setEventAreas(areas: EventAreaDto[]): void
  setMetricRecords(records: EventMetricRecordDto[]): void
  setMetrics(metrics: EventMetricDto[]): void
  setPosters(posters: PosterDto[]): void
}

export default {
  async beforeRouteEnter(to, from, next) {
    const { eventId } = to.params

    const event = (await apiClient.events.get(eventId.toString())).payload.data
    const { event_type } = event
    if ([EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(event_type)) {
      const [eventAreasRequest, metricsRequest] = await Promise.all([
        apiClient.eventAreas.list({ event: eventId.toString() }),
        apiClient.eventMetricRecords.list({ event: eventId.toString() }, [
          'metric'
        ])
      ])

      next((vm) => {
        const instance = vm as IInstance
        instance.setEvent(event)
        instance.setEventType(event_type)
        instance.setEventAreas(eventAreasRequest.payload.data)
        instance.setMetricRecords(metricsRequest.payload.data)
        instance.setMetrics(metricsRequest.payload.embedded.metric)
      })
    }
    if (event_type === EventTypes.POSTERS) {
      const [eventAreasRequest, postersRequest] = await Promise.all([
        apiClient.eventAreas.list({ event: eventId.toString() }),
        apiClient.posters.list({
          event: eventId,
          include_expired_events: true,
          include_expired_campaigns: true
        })
      ])
      next((vm) => {
        const instance = vm as IInstance
        instance.setEvent(event)
        instance.setEventType(event_type)
        instance.setEventAreas(eventAreasRequest.payload.data)
        instance.setPosters(postersRequest.payload.data)
      })
    }
  }
}
</script>
<script setup lang="ts">
import { ComponentPublicInstance, ref } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { apiClient } from 'src/api/ApiClient'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventTypes } from 'src/api/model/EventTypes'
import MetricBasedPrintout from 'components/print/MetricBasedPrintout.vue'
import PostersPrintout from 'components/print/PostersPrintout.vue'
import { PosterDto } from 'src/api/model/PosterDto'

const event = ref<EventDto | null>(null)
const eventAreas = ref<EventAreaDto[]>([])
const eventType = ref<EventTypes>(EventTypes.DOOR_TO_DOOR)
const metricRecords = ref<EventMetricRecordDto[]>([])
const metrics = ref<EventMetricDto[]>([])
const posters = ref<PosterDto[]>([])

function setEvent(newEvent: EventDto) {
  event.value = newEvent
}
function setEventType(type: EventTypes) {
  eventType.value = type
}
function setEventAreas(areas: EventAreaDto[]) {
  eventAreas.value = areas
}
function setMetricRecords(records: EventMetricRecordDto[]) {
  metricRecords.value = records
}
function setMetrics(newMetrics: EventMetricDto[]) {
  metrics.value = newMetrics
}
function setPosters(newPosters: PosterDto[]) {
  posters.value = newPosters
}

defineExpose({
  setEvent,
  setEventType,
  setEventAreas,
  setMetricRecords,
  setMetrics,
  setPosters
})
</script>

<template>
  <MetricBasedPrintout
    v-if="
      event && [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(eventType)
    "
    :event="event"
    :event-areas="eventAreas"
    :metric-records="metricRecords"
    :metrics="metrics"
  />
  <PostersPrintout
    v-if="event && eventType === EventTypes.POSTERS"
    :event="event"
    :event-areas="eventAreas"
    :posters="posters"
  />
</template>
