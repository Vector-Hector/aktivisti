import { Store } from 'src/store/Store'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { LocationDto } from 'src/api/model/LocationDto'
import { TinyEmitter } from 'tiny-emitter'

export type PlaceSuggestion = { location: LocationDto, suggestion?: string }

export const START_DRAW_AREA = 'START_DRAW_AREA'
export const EditEventBus = new TinyEmitter()

interface EditEventState {
  event: EventDto | null
  eventAreas: EventAreaDto[]
  campaigns: CampaignDto[]
  metricRecords: EventMetricRecordDto[],
  updatingAreaFeatureIds: Set<string>
  deletingAreaIds: Set<string>
  placeSuggestion: PlaceSuggestion | null,
}

class EditEventStore extends Store<EditEventState> {
  protected data(): EditEventState {
    return {
      event: null,
      eventAreas: [],
      campaigns: [],
      metricRecords: [],
      updatingAreaFeatureIds: new Set<string>(),
      deletingAreaIds: new Set<string>(),
      placeSuggestion: null
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

  public setUpdatingAreaFeatureIds(ids: string[] | Set<string>) {
    this.state.updatingAreaFeatureIds = new Set(ids)
  }

  public setDeletingAreaIds(ids: string[] | Set<string>) {
    this.state.deletingAreaIds = new Set(ids)

  }
}

export const editEventStore = new EditEventStore()
