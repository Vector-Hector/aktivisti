import { defineComponent } from 'vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import EventAreaStreetMap from 'pages/event-map/detail/area/street/EventAreaStreetMap.vue'
import InjectMapMixin from 'pages/event-detail/InjectMapMixin'
import { useEventAreaMetricsComposable } from 'pages/event-map/detail/area/metrics/EventAreaMetricsMixin'
import { PropType } from 'vue/dist/vue'
import { useEventAreaStreetComposable } from 'pages/event-map/detail/area/street/EventAreaStreetMixin'

export default defineComponent({
  name: 'EventAreaMetricsMap',
  extends: EventAreaStreetMap,
  mixins: [InjectMapMixin],
  props: {
    houseNumber: {
      type: String as PropType<string>,
      required: true
    },
    street: {
      type: String as PropType<string>,
      required: true
    },
    areaId: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup(props) {
    // `addresses` seems to be needed so it can be forwarded to the `EventAreaStreetMap`
    //  as this file is extending it
    const { addresses } = useEventAreaStreetComposable(props)
    const { bbox } = useEventAreaMetricsComposable(props)
    return { bbox, addresses }
  },
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  }
})
