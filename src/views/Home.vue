<template>
  <IonContent>
    <div class="container">
      <h2>Veranstaltungen in deiner Nähe</h2>
      <div class="autocomplete">
        <IonSelect
          v-model="filteredCampaigns"
          :multiple="true"
          placeholder="Alle Kampagnen"
          :selected-text="campaigns.filter(campaign => filteredCampaigns.includes(campaign.id)).map(campaign => campaign.name).join(', ')"
        >
          <IonSelectOption
            v-for="campaign in campaigns"
            :key="campaign.id"
            :value="campaign.id"
          >
            {{ campaign.name }}
          </IonSelectOption>
        </IonSelect>
      </div>
    </div>
    <Map
      :center="center"
      :zoom="zoom ?? 14"
      map-style="mapbox://styles/mapbox/streets-v11"
      @update:center="updateUserLocation"
      @update:zoom="updateUserZoom"
    >
      <Marker
        v-for="event in events"
        :key="event.id"
        :location="event.location.center"
      >
        <Popup>
          <div class="popup-contents">
            <span class="popup-title">{{ event.name }}</span>
            <span class="popup-campaign">{{ event.campaign?.name }}</span>
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
    </Map>
  </IonContent>
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
  IonContent,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'

export default defineComponent({
  name: 'Home',
  components: {
    Popup,
    Map,
    Marker,
    Button,
    IonContent,
    IonSelect,
    IonSelectOption
  },
  beforeRouteEnter(to, from, next) {
    if (userStore.getState().location == null) {
      next({ name: 'splash' })
    }
    next()
  },
  data() {
    return {
      zoom: userStore.getState().zoom,
      iconWidth: 25,
      iconHeight: 40,
      center: userStore.getState().location,
      events: [] as EventDto[],
      filteredCampaigns: userStore.getState().campaigns,
      campaigns: [] as CampaignDto[],
      selectedCampaign: null as CampaignDto | null,
    }
  },
  watch: {
    async filteredCampaigns(newValue) {
      this.events = []
      this.updateUserCampaign(this.filteredCampaigns)

      const response = await this.$apiClient.events.list({
        campaigns: newValue ?? undefined
      })
      this.events = response.payload.data
    }
  },
  created() {
    this.getEvents()
    this.getCampaigns()
  },
  methods: {
    updateUserLocation(location: LocationDto) {
      userStore.locate(location)
    },
    updateUserZoom(zoom: number) {
      userStore.setZoom(zoom)
    },
    updateUserCampaign(campaigns: number[] | null) {
      userStore.setCampaigns(campaigns)
    },
    async getEvents() {
      let response
      if (this.filteredCampaigns) {
        response = await this.$apiClient.events.list({
          campaigns: this.filteredCampaigns ?? undefined
        })
      } else {
        response = await this.$apiClient.events.list()
      }
      this.events = response.payload.data
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
