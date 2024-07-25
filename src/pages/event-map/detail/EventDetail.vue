<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
export default {
  async beforeRouteEnter(to, from, next) {
    const { eventId } = to.params
    const authStore = getAuthStore()
    try {
      const [eventRequest, eventPermissionsRequest] = await Promise.all([
        apiClient.events.get(eventId.toString(), ['campaigns']),
        apiClient.eventPermissions.get({ event: eventId.toString() })
      ])
      const event = eventRequest.payload.data
      const campaigns = eventRequest.payload.embedded.campaigns as CampaignDto[]
      const eventPermissions = eventPermissionsRequest.payload.data
      eventDetailStore.setEvent(event)
      eventDetailStore.setCampaigns(campaigns)
      eventDetailStore.setEventPermissions(eventPermissions)

      const permissionRequests: Array<Promise<void>> = []
      if (
        includesOneOf(eventPermissions.permissions, [
          ObjectPermissions.TeamCaptain,
          ObjectPermissions.Coordinator
        ])
      ) {
        permissionRequests.push(
          apiClient.eventParticipations
            .list({
              event: eventId
            })
            .then((response) => {
              eventDetailStore.setParticipations(response.payload.data)
            })
        )
      }
      if (authStore.isLoggedIn()) {
        permissionRequests.push(
          apiClient.eventParticipations
            .list({
              event: eventId,
              user: authStore.getState().userId,
              show_permissions: true
            })
            .then((response) => {
              eventDetailStore.setPersonalParticipation(
                response.payload.data?.find(
                  ({ user }) => user === authStore.getState().userId
                ) ?? null
              )
              eventDetailStore.setPersonalParticipationPermissions(
                response.payload.permissions
              )
            })
        )
      }
      await Promise.all(permissionRequests)

      // verfied users can see event areas as well as users with write permission
      if (
        eventDetailStore.getState().personalParticipation?.is_verified ||
        includesOneOf(eventPermissions.permissions, [
          ObjectPermissions.TeamCaptain,
          ObjectPermissions.Coordinator
        ])
      ) {
        const promises: Promise<any>[] = [
          apiClient.eventAreas.list({ event: eventId })
        ]
        if (eventRequest.payload.data.event_type === EventTypes.POSTERS) {
          promises.push(
            apiClient.posters.list({
              event: eventId,
              include_expired_events: true,
              include_expired_campaigns: true
            })
          )
        }
        const [eventAreaRequest, posterRequest] = await Promise.all(promises)
        eventDetailStore.setEventAreas(eventAreaRequest.payload.data)
        if (posterRequest) {
          eventDetailStore.state.posters = posterRequest.payload.data
        }
      }

      next(() => {
        uiStore.updateActiveElements({
          event: eventDetailStore.getState().event!.name,
          campaigns: eventDetailStore
            .getState()
            .campaigns.map(({ name }) => name)
            .join(',')
        })
      })
    } catch (e) {
      if (apiClient.isApiClientError(e) && e.response?.status === 404) {
        next({ name: 'login' })
      }
    }
  }
}
</script>
<script setup lang="ts">
import { apiClient } from 'src/api/ApiClient'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { uiStore } from 'src/store/UiStore'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { getAuthStore } from 'src/store/AuthStore'
import { ObjectPermissions } from 'src/api/model/ObjectPermissionDto'
import { includesOneOf } from 'src/utils/array'
import { EventTypes } from 'src/api/model/EventTypes'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { onBeforeRouteLeave } from 'vue-router'

const { event } = useEventDetailStore()

onBeforeRouteLeave(() => {
  eventDetailStore.reset()
})
</script>

<template>
  <router-view v-if="event" />
</template>

<style lang="scss" scoped></style>
