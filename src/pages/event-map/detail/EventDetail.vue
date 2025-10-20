<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
export default {
  async beforeRouteEnter(to, from, next) {
    const { eventId } = to.params
    const authStore = getAuthStore()
    const eventStore = useEventStore()
    try {
      const [eventRequest, eventPermissionsRequest] = await Promise.all([
        apiClient.events.get(eventId.toString(), ['campaigns']),
        apiClient.eventPermissions.get({ event: eventId.toString() })
      ])
      const event = eventRequest.payload.data
      const campaigns = eventRequest.payload.embedded.campaigns as CampaignDto[]
      const eventPermissions = eventPermissionsRequest.payload.data
      eventStore.setEvent(event)
      eventStore.setCampaigns(campaigns)
      eventStore.setEventPermissions(eventPermissions)

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
              eventStore.participations = response.payload.data
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
              eventStore.personalParticipation =
                response.payload.data?.find(
                  ({ user }) => user === authStore.getState().userId
                ) ?? null
              eventStore.setPersonalParticipationPermissions(
                response.payload.permissions
              )
            })
        )
      }
      await Promise.all(permissionRequests)

      // verfied users can see event areas as well as users with write permission
      if (
        eventStore.personalParticipation?.is_verified ||
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
        eventStore.setEventAreas(eventAreaRequest.payload.data)
        if (posterRequest) {
          eventStore.posters = posterRequest.payload.data
        }
      }

      next(() => {
        uiStore.updateActiveElements({
          event: eventStore.event!.name,
          campaigns: eventStore.campaigns.map(({ name }) => name).join(',')
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
import { useEventStore } from 'src/stores/event'
import { getAuthStore } from 'src/store/AuthStore'
import { ObjectPermissions } from 'src/api/model/ObjectPermissionDto'
import { includesOneOf } from 'src/utils/array'
import { EventTypes } from 'src/api/model/EventTypes'
import { onUnmounted } from 'vue'

const eventStore = useEventStore()

onUnmounted(() => {
  eventStore.$reset()
})
</script>

<template>
  <router-view v-if="eventStore.event" />
</template>

<style lang="scss" scoped></style>
