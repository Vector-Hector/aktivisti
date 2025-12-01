import { Store } from 'src/store/Store'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { TinyEmitter } from 'tiny-emitter'
import { Feature } from 'geojson'

export const START_DRAW_AREA = 'START_DRAW_AREA'
export const PAN_TO_BBOX = 'PAN_TO_BBOX'

export const EditEventBus = new TinyEmitter()

interface EditEventState {
  event: EventDto | null
  eventAreas: EventAreaDto[]
  campaigns: CampaignDto[]
  metricRecords: EventMetricRecordDto[]
  updatingAreaFeatureIds: Set<string>
  areasWithError: Record<string, string>
  deletingAreaIds: Set<string>
  selectedFeatures: Feature[] | null
}

class EditEventStore extends Store<EditEventState> {
  protected data(): EditEventState {
    return {
      event: null,
      eventAreas: [],
      campaigns: [],
      metricRecords: [],
      updatingAreaFeatureIds: new Set<string>(),
      areasWithError: {},
      deletingAreaIds: new Set<string>(),
      selectedFeatures: null
    }
  }

  public setEvent(event: EventDto) {
    this.state.event = event
  }

  public setMetricRecords(metricRecords: EventMetricRecordDto[]) {
    this.state.metricRecords = metricRecords
  }

  public setEventAreas(eventAreas: EventAreaDto[]) {
    this.state.eventAreas = eventAreas
  }

  public setCampaigns(campaigns: CampaignDto[]) {
    this.state.campaigns = campaigns
  }

  public setEventAreaError(id: string, msg: string) {
    this.state.areasWithError[id] = msg
  }

  public clearEventAreaError(id: string) {
    delete this.state.areasWithError[id]
  }

  public setUpdatingAreaFeatureIds(ids: string[] | Set<string>) {
    this.state.updatingAreaFeatureIds = new Set(ids)
  }

  public setDeletingAreaIds(ids: string[] | Set<string>) {
    this.state.deletingAreaIds = new Set(ids)
  }

  public setSelectedFeature(features: Feature[]) {
    this.state.selectedFeatures = features
  }
}

export const editEventStore = new EditEventStore()
