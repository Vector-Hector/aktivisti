<template>
  <div class="container">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { uiStore } from 'src/store/UiStore'
import { eventDetailStore } from 'src/store/EventDetailStore'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { userStore } from 'src/store/UserStore'
import { authService } from 'src/api/authService'


export default defineComponent({
  name: 'EventDetail',
  mixins: [EventDetailMixin],
  async beforeRouteEnter(to, from, next) {
    const initilizationRequests: Promise<any>[] = [
      apiClient.events.get(to.params.id.toString(), ['campaigns'], {
        show_permissions: true
      }).then((response) => {
        const event = response.payload.data
        const campaigns = response.payload.embedded.campaigns as CampaignDto[]
        const eventPermissions = response.payload.permissions
        eventDetailStore.setEvent(event)
        eventDetailStore.setCampaigns(campaigns)
        eventDetailStore.setEventPermissions(eventPermissions)

        if (eventPermissions.invite.POST) {
          return apiClient.eventParticipations.list({
            event: to.params.id
          })
        }
      }).then((response) => {
        // If we have invite permissions we have access to the participant list
        if (response) {
          eventDetailStore.setParticipations(response.payload.data)
        }
      }),
      apiClient.eventAreas.list({
        event: to.params.id
      })
    ]
    if (authService.isLoggedIn()) {
      initilizationRequests.push(apiClient.eventParticipations.list({
        event: to.params.id,
        user: userStore.getState().user?.id
      }))
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [eventRequest, eventAreaRequest, personalParticipationRequest] = await Promise.all(initilizationRequests)


    const eventAreas = eventAreaRequest.payload.data

    eventDetailStore.setPersonalParticipation(personalParticipationRequest ?? null)

    eventDetailStore.setEventAreas(eventAreas)

    next(() => {
      uiStore.updateActiveElements({
        event: eventDetailStore.getState().event!.name,
        campaigns: eventDetailStore.getState().campaigns.map(({name}) => name).join(',')
      })
    })
  },
  beforeRouteLeave() {
    eventDetailStore.reset()
  }
})

</script>

<style lang="scss" scoped>

</style>
