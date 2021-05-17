<template>
  <div class="page">
    <div class="container">
      <div class="autocomplete">
        <IonSelect
          v-model="filteredCampaigns"
          :multiple="true"
          placeholder="Alle Kampagnen"
          :selected-text="campaigns.filter(campaign => filteredCampaigns?.includes(campaign.id)).map(campaign => campaign.name).join(', ')"
        >
          <IonSelectOption
            v-for="campaign in campaigns"
            :key="campaign.id"
            :value="campaign.id"
          >
            {{ campaign.name }} ({{ showCampaignLevel(campaign) }})
          </IonSelectOption>
        </IonSelect>
      </div>
    </div>
    <Map
      ref="map"
      v-model:zoom="zoom"
      v-model:center="userLocation"
      map-style="mapbox://styles/mapbox/streets-v11"
      @update:boundingBox="boundingBox = $event"
    >
      <span v-if="clusterMode">
        <ClusterLayer
          :clusters="clusters"
        />
      </span>
      <span
        v-else
      >
        <span
          v-for="event in events"
          :key="event.id"
        >
          <Marker

            :location="event.location"
          >
            <Popup>
              <div class="popup-contents">
                <span class="popup-title">{{ event.name }}</span>
                <span class="popup-campaign">{{ event.campaigns?.map(({name}) => name).join(',') }}</span>
                <span class="popup-date">
                  {{ new Date(event.start_date).toLocaleString() }}
                </span>
                <router-link
                  class="join-link no-button-decoration"
                  :to="`/events/${event.id}`"
                >
                  <Button class="p-button button-red join-button"> Mitmachen/Infos</Button>
                </router-link>
              </div>
            </Popup>
          </Marker>
        </span>
      </span>
    </Map>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from '@/lib/mapbox/Map.vue'
import Marker from '@/lib/mapbox/Marker.vue'
import { EventDto } from '@/api/model/EventDto'
import { CampaignDto } from '@/api/model/CampaignDto'
import Popup from '@/lib/mapbox/Popup.vue'
import { userStore } from '@/store/UserStore'
import Button from 'primevue/button'
import { LocationDto } from '@/api/model/LocationDto'
import {
  IonSelect,
  IonSelectOption, toastController
} from '@ionic/vue'
import { Feature } from 'geojson'
import { ClusterDto } from '@/api/model/ClusterDto'
import ClusterLayer from '@/lib/mapbox/ClusterLayer.vue'
import { isEqual } from 'lodash-es'

const MAX_EVENTS = 100
import { showCampaignLevel } from '@/utils/showCampaignLevel'

export default defineComponent({
  name: 'Home',
  components: {
    ClusterLayer,
    Popup,
    Map,
    Marker,
    Button,
    IonSelect,
    IonSelectOption
  },
  beforeRouteEnter(to, from, next) {
    if (userStore.getState().location == null) {
      next({name: 'splash'})
    }
    next()
  },
  data() {
    return {
      iconWidth: 25,
      iconHeight: 40,
      center: userStore.getState().location,
      events: [] as EventDto[],
      campaigns: [] as CampaignDto[],
      selectedCampaign: null as CampaignDto | null,
      clusters: [] as ClusterDto[],
      clusterMode: true,
      boundingBox: null as Feature | null,
      tooManyEventsWarningShowing: false
    }
  },
  computed: {
    filteredCampaigns: {
      get() {
        return userStore.getState().campaigns
      },
      set(value) {
        userStore.setCampaigns(value)
      }
    },
    zoom: {
      get() {
        return userStore.getState().zoom
      },
      set(value: number) {
        userStore.setZoom(value)
      }
    },
    userLocation: {
      get() {
        return userStore.getState().location
      },
      set(value: LocationDto) {
        userStore.locate(value)
      }
    },
    filterParams(): { [key: string]: any } {
      return {
        campaigns: this.filteredCampaigns,
        within: this.boundingBox ? JSON.stringify(this.boundingBox.geometry) : undefined,
        limit: MAX_EVENTS
      }
    }
  },
  watch: {
    filterParams: {
      handler(newValue, oldValue) {
        if (isEqual(newValue, oldValue)) return
        this.updateView()
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.getCampaigns()
  },
  methods: {
    showCampaignLevel,
    async updateView() {
      const clusterResponse = await this.$apiClient.eventClusters.list(this.filterParams)
      if (isEqual(this.clusters, clusterResponse.payload.data)) {
        return
      }
      this.clusters = clusterResponse.payload.data
      if (this.clusters.reduce((acc, item) => acc + item.count, 0) <= MAX_EVENTS) {
        this.clusterMode = false
        const eventsResponse = await this.$apiClient.events.list(this.filterParams)
        this.events = eventsResponse.payload.data
        this.clusterMode = false
      } else if (this.zoom! > 15) {
        this.clusterMode = false
        const eventsResponse = await this.$apiClient.events.list(this.filterParams)
        this.events = eventsResponse.payload.data
        if (!this.tooManyEventsWarningShowing) {
          const toast = await toastController.create({
            color: 'warning',
            duration: 3500,
            header: 'Hier ist zuviel los',
            message: 'Nicht alle Events werden an gezeigt, da dies zuviel für die Karte wäre. Nutze die Listenansicht'

          })
          toast.onDidDismiss()
            .then(() => this.tooManyEventsWarningShowing = false)
          await toast.present()
          this.tooManyEventsWarningShowing = true

        }
      } else {
        this.clusterMode = true
      }
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    }
  }
})
</script>

<style lang="scss" scoped>
.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-campaign {
  display: block;
  font-size: 0.9rem;
}

.popup-date {
  display: block;
  font-size: 0.9rem;
}

.map {
  width: auto;
}

.join-link {
  align-self: flex-end;

  Button {
    padding: 3px 6px;
  }

  margin-top: 6px;
}

.popup-contents {
  display: flex;
  flex-direction: column;
}
</style>
