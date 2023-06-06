import { defineComponent } from 'vue'
import { eventOverviewStore } from 'src/store/EventOverviewStore'
import { EventDto } from 'src/api/model/EventDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'
import { EventGeoJsonDto } from 'src/api/model/EventGeoJsonDto'

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
      return eventOverviewStore.getState().bbox !== null
        ? bboxPolygon(eventOverviewStore.getState().bbox!).geometry
        : null
    },
    events: {
      get() {
        return eventOverviewStore.getState().events
      },
      set(value: EventDto[]) {
        eventOverviewStore.setEvents(value)
      }
    },
    featureCollection: {
      get() {
        return eventOverviewStore.getState().featureCollection
      },
      set(value: EventGeoJsonDto) {
        eventOverviewStore.setStubs(value)
      }
    }
  }
})
