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
    const eventRequest = await apiClient.events.get(to.params.id.toString(), ['campaigns'], {
      show_permissions: true
    })
    const event = eventRequest.payload.data
    const campaigns = eventRequest.payload.embedded.campaigns as CampaignDto[]
    const eventPermissions = eventRequest.payload.permissions
    eventDetailStore.setEvent(event)
    eventDetailStore.setCampaigns(campaigns)
    eventDetailStore.setEventPermissions(eventPermissions)

    const permissionRequests = []
    if (eventPermissions.invite.POST) {
      permissionRequests.push(apiClient.eventParticipations.list({
        event: to.params.id
      }).then((response) => {
        eventDetailStore.setParticipations(response.payload.data)
      }))
    }
    if (authService.isLoggedIn()) {
      permissionRequests.push(apiClient.eventParticipations.list({
        event: to.params.id,
        user: userStore.getState().user?.id
      }).then((response) => {
        eventDetailStore.setPersonalParticipation(response.payload.data?.[0] ?? null)
      }))
    }
    await Promise.all(permissionRequests)

    // verfied users can see event areas as well as users with write permission
    if (
      eventDetailStore.getState().personalParticipation?.is_verified ||
      eventDetailStore.getState().eventPermissions?.self.PATCH
    ) {
      const eventAreaRequest = await apiClient.eventAreas.list({event: to.params.id})
      eventDetailStore.setEventAreas(eventAreaRequest.payload.data)
    }


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
