import { Store } from 'src/store/Store'
import { EventDto } from 'src/api/model/EventDto'
import { ClusterDto } from 'src/api/model/ClusterDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

interface EventMapStoreState {
  bbox: BBox2d | null
  events: EventDto[]
  clusters: ClusterDto[]
}

class EventOverviewStore extends Store<EventMapStoreState> {

  protected data(): EventMapStoreState {
    return {
      bbox: null,
      events: [],
      clusters: []
    }
  }

  public setBbox(bbox: BBox2d) {
    this.state.bbox = bbox
  }

  public setClusters(clusters: ClusterDto[]) {
    this.state.clusters = clusters
  }

  public setEvents(events: EventDto[]) {
    this.state.events = events
  }
}

export const eventOverviewStore = new EventOverviewStore()
