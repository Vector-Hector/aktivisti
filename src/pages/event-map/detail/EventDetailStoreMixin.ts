import { defineComponent } from 'vue'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { PermissionsDto } from 'src/api/model/APIEnvelope'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { eventDetailStore } from 'src/store/EventDetailStore'

export default defineComponent({
  name: 'EventDetailStoreMixin',
  computed: {
    participations: {
      get(): EventParticipationDto[] {
        return eventDetailStore.getState().participations
      },
      set(value: EventParticipationDto[]) {
        eventDetailStore.setParticipations(value)
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
      get(): PermissionsDto | null {
        return eventDetailStore.getState().eventPermissions
      },
      set(value: PermissionsDto) {
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
      get(): PermissionsDto | null {
        return eventDetailStore.getState().eventAreaPermissions
      },
      set(value: PermissionsDto) {
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
