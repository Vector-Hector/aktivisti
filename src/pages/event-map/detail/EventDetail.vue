<template>
  <div class="container">
    <router-view
      v-model:event="event"
      v-model:eventAreas="eventAreas"
      v-model:participations="participations"
      :event-permissions="eventPermissions"
      :campaigns="campaigns"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ellipse, chevronForward } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { authService } from 'src/api/authService'
import { userStore } from 'src/store/UserStore'
import { BBox, Feature } from 'geojson'
import { bbox, circle } from '@turf/turf'
import { apiClient } from 'src/api/ApiClient'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { uiStore } from 'src/store/UiStore'
import { eventDetailStore } from 'src/store/EventDetailStore'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

addIcons({
  ellipse,
  chevronForward
})

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
  },
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },
  data() {
    return {
      initialZoomBox: null as BBox2d | null,
      joinLoading: false,
      dateOptions: {
        year: 'numeric',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  },
  computed: {
    areaFeatures(): Feature[] {
      return this.eventAreas.map((area) => {
        return {
          type: 'Feature',
          id: area.feature_id,
          geometry: area.geometry,
          properties: {
            color: area.color
          }
        }
      })
    },
    zoomBox(): BBox {
      return this.areaFeatures.length > 0 ? bbox({
        type: 'FeatureCollection',
        features: this.areaFeatures
      }) : bbox(circle([this.event.location.lng, this.event.location.lat], 0.2))
    },
    isLoggedIn(): boolean {
      return authService.isLoggedIn()
    },
    isMember(): boolean {
      return this.event?.participants.find((id) => id === userStore.getState().user?.id) !== undefined
    }
  },
  created() {
    this.initialZoomBox = this.areaFeatures.length > 0 ? bbox({
      type: 'FeatureCollection',
      features: this.areaFeatures
    }) as BBox2d : bbox(circle([this.event.location.lng, this.event.location.lat], 0.2)) as BBox2d
  },
  methods: {
    async getEventAreas() {
      this.eventAreas = (await this.$apiClient.eventAreas.list({event: this.id})).payload.data
    }
  }
})

</script>

<style lang="scss" scoped>

</style>
