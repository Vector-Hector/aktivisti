<template>
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
        />
      </div>
    </IonContent>
    <div class="map-container">
      <Map
        ref="map"
        :center="event.location.center"
      >
        <router-view
          :event="event"
          :event-areas="eventAreas"
          name="map"
        />
      </Map>
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
  props: {
    id: {
      type: String as PropType<string>,
      required: true
    }
  },
  data() {
    return {
      event: null as EventDto | null,
      eventAreas: [] as EventAreaDto[],
      campaign: null,
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
    await this.getEvent()
    await this.getEventAreas()

    this.loading = false
  },
  methods: {
    async getEvent() {
      const eventRequest = (await this.$apiClient.events.get(this.id, ['campaign']))
      this.event = eventRequest.payload.data
      this.campaign = eventRequest.payload.embedded.campaign[0]
    },

    async getEventAreas() {
      if (this.event) {
        this.eventAreas = (await this.$apiClient.eventAreas.list({event: this.event.id})).payload.data
      }
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
