import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { PermissionHintsDto } from 'src/api/model/APIEnvelope'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'

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
        eventDetailStore.setParticipations(value)
      }
    },
    personalParticipation: {
      get(): EventParticipationDto | null {
        return eventDetailStore.getState().personalParticipation
      },
      set(value: EventParticipationDto | null) {
        eventDetailStore.setPersonalParticipation(value)
      }
    },
    event: {
      get(): EventDto {
        return eventDetailStore.getState().event!
      },
      set(value: EventDto) {
        eventDetailStore.setEvent(value)
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
      get(): PermissionHintsDto | null {
        return eventDetailStore.getState().eventPermissions
      },
      set(value: PermissionHintsDto) {
        eventDetailStore.setEventPermissions(value)
      }
    },
    eventArea: {
      get(): EventAreaDto {
        return eventDetailStore.getState().eventArea!
      },
      set(value: EventAreaDto) {
        eventDetailStore.setEventArea(value)
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
    }
  }
})
