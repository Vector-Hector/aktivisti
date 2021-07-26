<template>
  <router-view
    v-slot="{Component}"
  >
    <component :is="Component" />
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from 'src/mapbox/Map.vue'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer'
import { apiClient } from 'src/api/ApiClient'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { eventDetailStore } from 'src/store/EventDetailStore'
import Timeout = NodeJS.Timeout
import { EventTypes } from 'src/api/model/EventTypes'
import { NavigationGuardNext, RouteLocation } from 'vue-router'
import { uiStore } from 'src/store/UiStore'

async function updateRoute(to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) {
  const {areaId} = to.params
  if (areaId === 'undefined') {
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
      {show_permissions: true}
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
  components: {
    FeatureLayer,
    Map
  },
  mixins: [EventDetailMixin],
  beforeRouteEnter: updateRoute,
  beforeRouteUpdate: updateRoute,
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
        (await this.$apiClient.completionNotes.list({event_area: this.eventArea.id})).payload.data
      )
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.nextPoll = setTimeout(() => this.pollForCompletionNotes(), 5000)
    }
  }
})

</script>

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
