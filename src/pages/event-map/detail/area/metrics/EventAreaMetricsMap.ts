import { defineComponent } from 'vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import EventAreaMetricsMixin from 'pages/event-map/detail/area/metrics/EventAreaMetricsMixin'
import EventAreaStreetMap from 'pages/event-map/detail/area/street/EventAreaStreetMap.vue'
import InjectMapMixin from 'pages/event-detail/InjectMapMixin'

export default defineComponent({
  name: 'EventAreaMetricsMap',
  extends: EventAreaStreetMap,
  mixins: [EventAreaMetricsMixin, InjectMapMixin],
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  }
})
