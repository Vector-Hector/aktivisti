<template>
  <DoorToDoorPrintout
    :event="event"
    :event-areas="eventAreas"
    :metrics="metrics"
    :metric-records="metricRecords"
    v-if="event.event_type === EventTypes.DOOR_TO_DOOR"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import DoorToDoorPrintout from 'components/print/DoorToDoorPrintout.vue'
import { EventTypes } from 'src/api/model/EventTypes'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'


export default defineComponent({
  name: 'EventPrintout',
  components: {DoorToDoorPrintout},
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true
    },
    eventAreas: {
      type: Array as PropType<EventAreaDto[]>,
      required: true
    },
    metrics: {
      type: Array as PropType<EventMetricDto[]>,
      required: true
    },
    metricRecords: {
      type: Array as PropType<EventMetricRecordDto[]>,
      required: true
    }
  },
  data() {
    return {
      EventTypes
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
