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
import { authStore } from 'src/store/AuthStore'
import { ObjectPermissions } from 'src/api/model/ObjectPermissionDto'
import { includesOneOf } from 'src/utils/array'


export default defineComponent({
  name: 'EventDetail',
  mixins: [EventDetailMixin],
  async beforeRouteEnter(to, from, next) {
    try {
      const [eventRequest, eventPermissionsRequest] = await Promise.all([
       apiClient.events.get(to.params.id.toString(), ['campaigns']),
        apiClient.eventPermissions.get({event: to.params.id.toString()})
      ])
      const event = eventRequest.payload.data
      const campaigns = eventRequest.payload.embedded.campaigns as CampaignDto[]
      const eventPermissions = eventPermissionsRequest.payload.data
      eventDetailStore.setEvent(event)
      eventDetailStore.setCampaigns(campaigns)
      eventDetailStore.setEventPermissions(eventPermissions)

      const permissionRequests = []
      if (includesOneOf(
        eventPermissions.permissions,
        [ObjectPermissions.TeamCaptain, ObjectPermissions.Coordinator])
      ) {
        permissionRequests.push(apiClient.eventParticipations.list({
          event: to.params.id
        }).then((response) => {
          eventDetailStore.setParticipations(response.payload.data)
        }))
      }
      if (authStore.isLoggedIn()) {
        permissionRequests.push(apiClient.eventParticipations.list({
          event: to.params.id,
          user: authStore.getState().userId,
          show_permissions: true
        }).then((response) => {
          eventDetailStore.setPersonalParticipation(
            response.payload.data?.find(({user}) => user === authStore.getState().userId) ?? null
          )
          eventDetailStore.setPersonalParticipationPermissions(response.payload.permissions)
        }))
      }
      await Promise.all(permissionRequests)

      // verfied users can see event areas as well as users with write permission
      if (
        eventDetailStore.getState().personalParticipation?.is_verified ||
        includesOneOf(
          eventPermissions.permissions,
          [ObjectPermissions.TeamCaptain, ObjectPermissions.Coordinator]
        )
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
    } catch(e) {
      const {status} = e?.response
      if (status === 404){
        next({name: 'login'})
      }
    }
  },
  unmounted() {
    eventDetailStore.reset()
  }
})

</script>

<style lang="scss" scoped>

</style>
