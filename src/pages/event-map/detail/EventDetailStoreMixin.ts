import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'
import { ObjectPermissionDto, ObjectPermissions } from 'src/api/model/ObjectPermissionDto'

export default defineComponent({
  name: 'EventDetailStoreMixin',
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },
  computed: {
    participations: {
      get(): EventParticipationDto[] {
        return eventDetailStore.getState().participations
      },
      set(value: EventParticipationDto[]) {
        const personalParticipation = value.find(({id}) => id === this.personalParticipation?.id)
        // if the update contains the personal one keep them in sync
        if (personalParticipation) {
          eventDetailStore.setPersonalParticipation(personalParticipation)
        }
        eventDetailStore.setParticipations(value)
      }
    },
    personalParticipation: {
      get(): EventParticipationDto | null {
        return eventDetailStore.getState().personalParticipation
      },
      set(value: EventParticipationDto | null) {
        const oldParticipation = this.personalParticipation
        const existingParticipationIndex = this.participations.findIndex(({id}) => oldParticipation?.id === id)
        // keep the participation list in sync
        if (value === null && existingParticipationIndex > -1) {
          eventDetailStore.setParticipations(this.participations.filter(({id}) => oldParticipation?.id !== id))
        } else if (value !== null && existingParticipationIndex > -1) {
          const newParticipations = [...eventDetailStore.getState().participations]
          newParticipations[existingParticipationIndex] = value
          eventDetailStore.setParticipations(newParticipations)
        } else if (value !== null && existingParticipationIndex === -1) {
          eventDetailStore.setParticipations([...eventDetailStore.getState().participations, value])
        }
        eventDetailStore.setPersonalParticipation(value)
      }
    },
    personalParticipationPermissions(): PermissionHintsDto | null {
      return eventDetailStore.getState().personalParticipationPermissions
    },
    completionNotes(): CompletionNoteDto[] {
      return eventDetailStore.getState().completionNotes
    },
    completedTargetIds(): string[] {
      return eventDetailStore.getState().completionNotes
        .filter(({completed}) => completed)
        .map(({target_id}) => target_id)
    },
    event: {
      get(): EventDto {
        return eventDetailStore.getState().event!
      },
      set(value: EventDto) {
        eventDetailStore.setEvent(value)
      }
    },
    eventArea: {
      get(): EventAreaDto {
        return eventDetailStore.getEventArea()!
      },
      set(value: EventAreaDto) {
        eventDetailStore.setEventArea(value)
      }
    },
    eventAreas: {
      get(): EventAreaDto[] {
        return eventDetailStore.getState().eventAreas
      },
      set(value: EventAreaDto[]) {
        eventDetailStore.setEventAreas(value)
      }
    },
    eventPermissions: {
      get(): ObjectPermissionDto | null {
        return eventDetailStore.getState().eventPermissions
      },
      set(value: ObjectPermissionDto) {
        eventDetailStore.setEventPermissions(value)
      }
    },
    eventAreaPermissions: {
      get(): PermissionHintsDto | null {
        return eventDetailStore.getState().eventAreaPermissions
      },
      set(value: PermissionHintsDto) {
        eventDetailStore.setEventAreaPermissions(value)
      }
    },
    campaigns: {
      get(): CampaignDto[] {
        return eventDetailStore.getState().campaigns
      },
      set(value: CampaignDto[]) {
        eventDetailStore.setCampaigns(value)
      }
    },
    isTeamCaptain(): boolean {
      return this.eventPermissions?.permissions?.includes(ObjectPermissions.TeamCaptain) ?? false
    },
    isCoordinator(): boolean {
      return this.eventPermissions?.permissions?.includes(ObjectPermissions.Coordinator) ?? false
    },
    isTeamCaptainOrCoordinator(): boolean {
      return this.isTeamCaptain || this.isCoordinator
    }
  },
})
