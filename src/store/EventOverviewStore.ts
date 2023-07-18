import { Store } from 'src/store/Store'
import { EventDto } from 'src/api/model/EventDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { EventGeoJsonDto } from 'src/api/model/EventGeoJsonDto'

interface EventMapStoreState {
  bbox: BBox2d | null
  events: EventDto[]
  featureCollection: EventGeoJsonDto | null
}

class EventOverviewStore extends Store<EventMapStoreState> {
  protected data(): EventMapStoreState {
    return {
      bbox: null,
      events: [],
      featureCollection: null
    }
  }

  public setBbox(bbox: BBox2d) {
    this.state.bbox = bbox
  }

  public setEvents(events: EventDto[]) {
    this.state.events = events
  }
}

export const eventOverviewStore = new EventOverviewStore()
