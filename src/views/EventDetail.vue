<template>
  <div class="page">
    <div
      v-if="event !== null && loading === false"
      class="event"
    >
      <IonContent
        class="content"
      >
        <div class="container">
          <router-view
            v-model:event="event"
            v-model:eventAreas="eventAreas"
            v-model:participations="participations"
            :campaigns="campaigns"
          />
        </div>
      </IonContent>
      <div class="map-container">
        <Map
          v-if="eventAreas"
          ref="map"
          :zoom="15"
          :center="event.location.center"
          :zoom-box="zoomBox"
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
import { EventDto } from '@/api/model/EventDto'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { IonContent } from '@ionic/vue'
import { ellipse, chevronForward } from 'ionicons/icons'
import { addIcons } from 'ionicons'
import { authService } from '@/api/authService'
import { userStore } from '@/store/UserStore'
import Map from '@/lib/mapbox/Map.vue'
import { BBox, Feature } from 'geojson'
import { bbox, circle } from '@turf/turf'
import { EventParticipationDto } from '@/api/model/EventParticipationDto'
import { apiClient } from '@/api/ApiClient'
import { CampaignDto } from '@/api/model/CampaignDto'
import { uiStore } from '@/store/UiStore'

addIcons({
  ellipse,
  chevronForward
})

export default defineComponent({
  name: 'EventDetail',
  components: {
    Map,
    IonContent
  },
  async beforeRouteEnter(to, from, next) {
    const participations = (await apiClient.eventParticipations.list({event: to.params.id})).payload.data
    const eventRequest = (await apiClient.events.get(to.params.id.toString(), ['campaigns']))
    const event = eventRequest.payload.data
    const campaigns = eventRequest.payload.embedded.campaigns as CampaignDto[]
    next(vm => {
      //@ts-ignore
      vm.participations = participations
      //@ts-ignore
      vm.event = event
      //@ts-ignore
      vm.campaigns = campaigns
      uiStore.setActiveElements({
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
      campaigns: null,
      loading: true,
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
      }) : bbox(circle([this.event!.location.center.lng, this.event!.location.center.lat], 0.2))
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
  },
  methods: {
    async getEventAreas() {
      this.eventAreas = (await this.$apiClient.eventAreas.list({event: this.id})).payload.data
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

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
  flex: 1
}


</style>
