<template>
  <MetricBasedPrintout
    v-if="event && [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(eventType)"
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
<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { apiClient } from 'src/api/ApiClient'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventTypes } from 'src/api/model/EventTypes';
import MetricBasedPrintout from 'components/print/MetricBasedPrintout.vue';
import PostersPrintout from 'components/print/PostersPrintout.vue';
import { PosterDto } from 'src/api/model/PosterDto';

export default defineComponent({
  name: 'PrintEvent',
  async beforeRouteEnter(to, from, next) {
    const {eventId} = to.params

    const event = (await apiClient.events.get(eventId.toString())).payload.data
    const {event_type} = event
    if ([EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(event_type)) {
      const [eventAreasRequest, metricsRequest] = await Promise.all([
        apiClient.eventAreas.list({event: eventId.toString()}),
        apiClient.eventMetricRecords.list({event: eventId.toString()}, ['metric'])
      ])

      next((vm) => {
        //@ts-ignore
        vm.event = event
        //@ts-ignore
        vm.eventType = event_type
        //@ts-ignore
        vm.eventAreas = eventAreasRequest.payload.data
        //@ts-ignore
        vm.metricRecords = metricsRequest.payload.data
        //@ts-ignore
        vm.metrics = metricsRequest.payload.embedded.metric
      })
    }
    if (event_type === EventTypes.POSTERS) {
      const [eventAreasRequest, postersRequest] = await Promise.all([
        apiClient.eventAreas.list({event: eventId.toString()}),
        apiClient.posters.list({event: eventId})
      ])
      next((vm) => {
        //@ts-ignore
        vm.event = event
        //@ts-ignore
        vm.eventType = event_type
        //@ts-ignore
        vm.eventAreas = eventAreasRequest.payload.data
        //@ts-ignore
        vm.posters = postersRequest.payload.data
      })
    }


  },
  components: {
    PostersPrintout,
    MetricBasedPrintout,
  },
  data() {
    return {
      event: null as EventDto | null,
      eventAreas: [] as EventAreaDto[],
      eventType: EventTypes.DOOR_TO_DOOR as EventTypes,
      metricRecords: [] as EventMetricRecordDto[],
      metrics: [] as EventMetricDto[],
      posters: [] as PosterDto[],
      EventTypes
    }
  }
})
</script>
