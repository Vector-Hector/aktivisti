import { defineComponent } from 'vue'
import { eventOverviewStore } from 'src/store/EventOverviewStore'
import { EventDto } from 'src/api/model/EventDto'
import { ClusterDto } from 'src/api/model/ClusterDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'

export default defineComponent({
  name: 'EventsOverviewMixin',
  computed: {
    bbox: {
      get() {
        return eventOverviewStore.getState().bbox
      },
      set(value: BBox2d) {
        eventOverviewStore.setBbox(value)
      }
    },
    boundingBoxJson() {
      return eventOverviewStore.getState().bbox ? bboxPolygon(eventOverviewStore.getState().bbox).geometry : null
    },
    events: {
      get() {
        return eventOverviewStore.getState().events
      },
      set(value: EventDto[]) {
        eventOverviewStore.setEvents(value)
      }
    },
    clusters: {
      get() {
        return eventOverviewStore.getState().clusters
      },
      set(value: ClusterDto[]) {
        eventOverviewStore.setClusters(value)
      }
    }
  }
})
