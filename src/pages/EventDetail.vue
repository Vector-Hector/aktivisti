<template>
  <div class="page">
    <div
      v-if="event !== null && loading === false"
      class="event"
    >
        <div class="container">
          <router-view
            v-model:event="event"
            v-model:eventAreas="eventAreas"
            v-model:participations="participations"
            :event-permissions="eventPermissions"
            :campaigns="campaigns"
          />
        </div>
      <div class="map-container">
        <Map
          v-if="eventAreas"
          ref="map"
          :zoom="15"
          :center="event.location"
          :zoom-box="initialZoomBox"
          :animate="false"
        >
          <router-view
            :event="event"
            :event-areas="eventAreas"
            name="map"
          />
        </Map>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { ellipse, chevronForward } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { authService } from 'src/api/authService'
import { userStore } from 'src/store/UserStore'
import Map from 'src/mapbox/Map.vue'
import { BBox, Feature } from 'geojson'
import { bbox, circle } from '@turf/turf'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { apiClient } from 'src/api/ApiClient'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { uiStore } from 'src/store/UiStore'
import { PermissionsDto } from 'src/api/model/APIEnvelope'

addIcons({
  ellipse,
  chevronForward
})

export default defineComponent({
  name: 'EventDetail',
  components: {
    Map
  },
  async beforeRouteEnter(to, from, next) {
    const participations = (await apiClient.eventParticipations.list({event: to.params.id})).payload.data
    const eventRequest = (await apiClient.events.get(to.params.id.toString(), ['campaigns'], {
      show_permissions: true
    }))
    const event = eventRequest.payload.data
    const campaigns = eventRequest.payload.embedded.campaigns as CampaignDto[]
    const eventPermissions = eventRequest.payload.permissions
    next(vm => {
      //@ts-ignore
      vm.participations = participations
      //@ts-ignore
      vm.event = event
      //@ts-ignore
      vm.campaigns = campaigns
      //@ts-ignore
      vm.eventPermissions = eventPermissions
      uiStore.updateActiveElements({
        // @ts-ignore
        event: vm.event.name,
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
      participations: [] as EventParticipationDto[],
      event: null as EventDto | null,
      eventAreas: [] as EventAreaDto[],
      initialZoomBox: null as BBox | null,
      campaigns: null,
      loading: true,
      joinLoading: false,
      eventPermissions: null as PermissionsDto | null,
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
      }) : bbox(circle([this.event!.location.lng, this.event!.location.lat], 0.2))
    },
    isLoggedIn(): boolean {
      return authService.isLoggedIn()
    },
    isMember(): boolean {
      return this.event?.participants.find((id) => id === userStore.getState().user?.id) !== undefined
    }
  },
  async created() {
    await this.getEventAreas()
    this.loading = false
    this.initialZoomBox = this.areaFeatures.length > 0 ? bbox({
      type: 'FeatureCollection',
      features: this.areaFeatures
    }) : bbox(circle([this.event!.location.lng, this.event!.location.lat], 0.2))
  },
  methods: {
    async getEventAreas() {
      this.eventAreas = (await this.$apiClient.eventAreas.list({event: this.id})).payload.data
    }
  }
})

</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";

label {
  text-align: left;
}

.event {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}

Button {
  margin: 10px;
  background: $red;
  border: 1px solid $red;
}

.campaign {
  font-weight: bold;
  display: block;
}

.full-width {
  width: 100%;
}

.event-name {
  margin: 0 0 1rem 0;
}

.chevron {
  margin-left: 2rem;
  font-size: 2rem;
}

.item-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.content {
  flex: 1
}

.map-container {
  flex: 1;
  display: flex;
}


</style>
