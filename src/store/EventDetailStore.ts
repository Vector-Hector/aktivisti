import { Store } from 'src/store/Store'
import { EventDto } from 'src/api/model/EventDto'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'
import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'
import { ObjectPermissionDto } from 'src/api/model/ObjectPermissionDto'
import { PosterDto } from 'src/api/model/PosterDto'

interface EventDetailStoreState {
  event: EventDto | null
  eventAreas: EventAreaDto[]
  eventAreaPermissions: PermissionHintsDto | null
  participations: EventParticipationDto[]
  personalParticipation: EventParticipationDto | null
  personalParticipationPermissions: PermissionHintsDto | null
  campaigns: CampaignDto[]
  eventPermissions: ObjectPermissionDto | null
  completionNotes: CompletionNoteDto[]
  selectedEventAreaId: null | number
  posters: PosterDto[]
  activePosterIndex: number | null
}

class EventDetailStore extends Store<EventDetailStoreState> {
  protected data(): EventDetailStoreState {
    return {
      event: null,
      eventAreas: [],
      selectedEventAreaId: null,
      eventAreaPermissions: null,
      participations: [],
      activePosterIndex: null,
      personalParticipation: null,
      personalParticipationPermissions: null,
      campaigns: [],
      eventPermissions: null,
      completionNotes: [] as CompletionNoteDto[],
      posters: []
    }
  }

  public setEvent(event: EventDto | null) {
    this.state.event = event
  }

  public getEventArea(): EventAreaDto | null {
    return (
      this.state.eventAreas.find(
        ({ id }) => id === this.state.selectedEventAreaId
      ) ?? null
    )
  }

  public updateEventArea(value: EventAreaDto) {
    const indexToReplace = this.state.eventAreas.findIndex(
      ({ id }) => value.id === id
    )
    this.state.eventAreas[indexToReplace] = value
  }

  public setEventArea(value: EventAreaDto | null) {
    if (value) {
      this.updateEventArea(value)
    }
    this.state.selectedEventAreaId = value?.id ?? null
  }

  public setEventAreaPermissions(permissions: PermissionHintsDto | null) {
    this.state.eventAreaPermissions = permissions
  }

  public setParticipations(participations: EventParticipationDto[]) {
    this.state.participations = participations
  }

  public setPersonalParticipation(participation: EventParticipationDto | null) {
    this.state.personalParticipation = participation
  }

  public setPersonalParticipationPermissions(
    permissions: PermissionHintsDto | null
  ) {
    this.state.personalParticipationPermissions = permissions
  }

  public setEventAreas(eventAreas: EventAreaDto[]) {
    this.state.eventAreas = eventAreas
  }

  public setEventPermissions(permissions: ObjectPermissionDto | null) {
    this.state.eventPermissions = permissions
  }

  public setCampaigns(campaigns: CampaignDto[]) {
    this.state.campaigns = campaigns
  }

  public addCompletionNotes(completionNotes: CompletionNoteDto[]) {
    const newIds = completionNotes.map(({ target_id }) => target_id)
    // discard any in the current set that are added with this new set
    this.state.completionNotes = [
      ...this.state.completionNotes.filter(
        ({ target_id }) => !newIds.includes(target_id)
      ),
      ...completionNotes
    ]
  }
}

export const eventDetailStore = new EventDetailStore()
