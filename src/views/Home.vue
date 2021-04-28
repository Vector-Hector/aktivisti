<template>
  <div class="container">
    <h2>Veranstaltungen in deiner Nähe</h2>
    <div class="autocomplete">
      <AutoComplete
        v-if="campaigns"
        v-model="campaign"
        class="autocomplete-width"
        :suggestions="filteredCampaigns"
        :dropdown="true"
        placeholder="Alle Kampagnen"
        field="name"
        @clear="getEvents"
        @item-select="filterEvents"
        @complete="searchCampaign($event)"
      >
        <template #item="slotProps">
          <div class="">
            <div>{{ slotProps.item.name }}</div>
          </div>
        </template>
      </AutoComplete>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from '@/lib/mapbox/Map.vue'
import Marker from '@/lib/mapbox/Marker.vue'
import AutoComplete from 'primevue/autocomplete'
import { EventDto } from '@/api/model/EventDto'
import { CampaignDto } from '@/api/model/CampaignDto'
import Popup from '@/lib/mapbox/Popup.vue'
import { userStore } from '@/store/UserStore'
import Button from 'primevue/button'
import { LocationDto } from '@/api/model/LocationDto'

export default defineComponent({
  name: 'Home',
  components: {
    Popup,
    Map,
    Marker,
    AutoComplete,
    Button,
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
      filteredCampaigns: [] as CampaignDto[],
      campaigns: [] as CampaignDto[],
      campaign: null as CampaignDto | null,
      selectedCampaign: null as CampaignDto | null
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
    async getEvents() {
      const response = await this.$apiClient.events.list()
      this.events = response.payload.data
    },
    async getCampaigns() {
      const response = await this.$apiClient.campaigns.list()
      this.campaigns = response.payload.data
    },
    searchCampaign(event: any) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredCampaigns = [...this.campaigns]
        } else {
          this.filteredCampaigns = this.campaigns.filter((campaign: any) => {
            return campaign.name.toLowerCase().startsWith(event.query.toLowerCase())
          })
        }
      }, 250)
    },
    async filterEvents() {
      const response = await this.$apiClient.events.list({
        campaigns: this.campaign?.id ?? undefined
      })
      this.events = response.payload.data
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
