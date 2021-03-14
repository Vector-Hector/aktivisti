import { defineComponent } from 'vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import EventAreaStreetMap from '@/views/event-detail/event-area/EventAreaStreetMap.vue'
import EventAreaMetricsMixin from '@/views/event-detail/event-area/EventAreaMetricsMixin'

export default defineComponent({
  name: 'EventAreaMetricsMap',
  extends: EventAreaStreetMap,
  mixins: [EventAreaMetricsMixin],
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  }
})
