<script lang="ts">
import { defineComponent } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import { eventDetailStore } from 'src/store/EventDetailStore'
import Timeout = NodeJS.Timeout
import { EventTypes } from 'src/api/model/EventTypes'
import { NavigationGuardNext, RouteLocation } from 'vue-router'
import { uiStore } from 'src/store/UiStore'
import { UNDEFINED_POSTER_AREA } from 'pages/event-map/detail/area/posters/detail/EventDetailPosterDetail.vue'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

async function updateRoute(
  to: RouteLocation,
  from: RouteLocation,
  next: NavigationGuardNext
) {
  const { areaId } = to.params
  if (areaId === UNDEFINED_POSTER_AREA) {
    // the special undefined route is for posters that are not assigned to an area
    eventDetailStore.setEventArea(null)
    eventDetailStore.setEventAreaPermissions(null)
    uiStore.updateActiveElements({
      eventArea: 'Undefiniertes Gebiet'
    })
    next()
  } else {
    const response = await apiClient.eventAreas.get(
      to.params.areaId as string,
      [],
      { show_permissions: true }
    )
    eventDetailStore.setEventArea(response.payload.data)
    eventDetailStore.setEventAreaPermissions(response.payload.permissions)
    uiStore.updateActiveElements({
      eventArea: `Aktionsgebiet ${response.payload.data.name}`
    })
    next()
  }
}

export default defineComponent({
  name: 'EventDetailArea',
  beforeRouteEnter: updateRoute,
  beforeRouteUpdate: updateRoute,
  setup() {
    const { event, eventArea } = useEventDetailStore()
    return { event, eventArea }
  },
  data() {
    return {
      nextPoll: null as Timeout | null
    }
  },
  async created() {
    // there are no completion notes in poster events
    if (this.event.event_type !== EventTypes.POSTERS) {
      await this.pollForCompletionNotes()
    }
  },
  unmounted() {
    if (this.nextPoll !== null) {
      clearTimeout(this.nextPoll)
    }
  },
  methods: {
    async pollForCompletionNotes() {
      eventDetailStore.addCompletionNotes(
        (
          await this.$apiClient.completionNotes.list({
            event_area: this.eventArea.id
          })
        ).payload.data
      )
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.nextPoll = setTimeout(() => this.pollForCompletionNotes(), 5000)
    }
  }
})
</script>

<template>
  <router-view />
</template>

<style lang="scss" scoped>
label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.event-area-title {
  margin: 0.8rem 0 0 0;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}
</style>
