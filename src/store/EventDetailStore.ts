import { Store } from 'src/store/Store'
import { EventDto } from 'src/api/model/EventDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'

interface EventDetailStoreState {
  event: EventDto | null
  eventAreas: EventAreaDto[]
  eventArea: EventAreaDto | null
  eventAreaPermissions: PermissionHintsDto | null
  participations: EventParticipationDto[]
  campaigns: CampaignDto[]
  eventPermissions: PermissionHintsDto | null
}

class EventDetailStore extends Store<EventDetailStoreState> {

  protected data(): EventDetailStoreState {
    return {
      event: null,
      eventAreas: [],
      eventArea: null,
      eventAreaPermissions: null,
      participations: [],
      campaigns: [],
      eventPermissions: null
    }
  }

  public setEvent(event: EventDto | null) {
    this.state.event = event
  }

  public setEventArea(eventArea: EventAreaDto | null) {
    this.state.eventArea = eventArea
  }

  public setEventAreaPermissions(permissions: PermissionHintsDto | null) {
    this.state.eventAreaPermissions = permissions
  }

  public setParticipations(participations: EventParticipationDto[]) {
    this.state.participations = participations
  }

  public setEventAreas(eventAreas: EventAreaDto[]) {
    this.state.eventAreas = eventAreas
  }

  public setEventPermissions(permissions: PermissionHintsDto | null) {
    this.state.eventPermissions = permissions
  }

  public setCampaigns(campaigns: CampaignDto[]) {
    this.state.campaigns = campaigns
  }
}

export const eventDetailStore = new EventDetailStore()
