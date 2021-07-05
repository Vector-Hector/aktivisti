<template>
  <EventPrintout
    v-if="event"
    :event="event"
    :event-areas="eventAreas"
    :metric-records="metricRecords"
    :metrics="metrics"
  />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { apiClient } from 'src/api/ApiClient'
import EventPrintout from 'components/print/EventPrintout.vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'

export default defineComponent({
  name: 'PrintEvent',
  async beforeRouteEnter(to, from, next) {
    const [eventRequest, eventAreasRequest, metricsRequest] = await Promise.all([
      apiClient.events.get(to.params.eventId.toString()),
      apiClient.eventAreas.list({event: to.params.eventId.toString()}),
      apiClient.eventMetricRecords.list({event: to.params.eventId.toString()}, ['metric'])
    ])

    next((vm) => {
      //@ts-ignore
      vm.event = eventRequest.payload.data
      //@ts-ignore
      vm.eventAreas = eventAreasRequest.payload.data
      //@ts-ignore
      vm.metricRecords = metricsRequest.payload.data
      //@ts-ignore
      vm.metrics = metricsRequest.payload.embedded.metric
    })
  },
  components: {
    EventPrintout
  },
  data() {
    return {
      event: null as EventDto | null,
      eventAreas: [] as EventAreaDto[],
      metricRecords: [] as EventMetricRecordDto[],
      metrics: [] as EventMetricDto[]
    }
  }
})
</script>
