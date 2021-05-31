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


export default defineComponent({
  name: 'EventDetail',
  mixins: [EventDetailMixin],
  async beforeRouteEnter(to, from, next) {
    const participations = (await apiClient.eventParticipations.list({event: to.params.id})).payload.data
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

    eventDetailStore.setParticipations(participations)
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
  }
})

</script>

<style lang="scss" scoped>

</style>
