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


export default defineComponent({
  name: 'EventDetail',
  mixins: [EventDetailMixin],
  async beforeRouteEnter(to, from, next) {
    const participation = (await apiClient.eventParticipations.list({
      event: to.params.id,
      user: userStore.getState().user?.id
    })).payload.data?.[0]
    const [eventRequest, eventAreaRequest] = await Promise.all([
      apiClient.events.get(to.params.id.toString(), ['campaigns'], {
        show_permissions: true
      }),
      apiClient.eventAreas.list({
        event: to.params.id
      })
    ])
    const event = eventRequest.payload.data
    const campaigns = eventRequest.payload.embedded.campaigns as CampaignDto[]
    const eventPermissions = eventRequest.payload.permissions
    const eventAreas = eventAreaRequest.payload.data

    // If we have invite permissions we have access to the participant list
    if (eventPermissions.invite.POST) {
      const participations = (await apiClient.eventParticipations.list({
        event: to.params.id
      })).payload.data
      eventDetailStore.setParticipations(participations)
    }

    eventDetailStore.setPersonalParticipation(participation ?? null)
    eventDetailStore.setEvent(event)
    eventDetailStore.setCampaigns(campaigns)
    eventDetailStore.setEventPermissions(eventPermissions)
    eventDetailStore.setEventAreas(eventAreas)

    next(() => {
      uiStore.updateActiveElements({
        //@ts-ignore
        event: event.name,
        campaigns: campaigns.map(({name}) => name).join(',')
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
