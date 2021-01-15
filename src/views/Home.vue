<template>
  <h1>Finde Veranstaltungen in deiner Nähe</h1>

  <div class="autocomplete">
    <AutoComplete
      v-if="campaigns"
      v-model="campaign"
      class="autocomplete-width"
      :suggestions="filteredCampaigns"
      :dropdown="true"
      field="title"
      @clear="getEvents"
      @item-select="filterEvents"
      @complete="searchCampaign($event)"
    >
      <template #item="slotProps">
        <div class="">
          <div>{{ slotProps.item.title }}</div>
        </div>
      </template>
    </AutoComplete>
  </div>

  <div class="map">
    <LMap
      v-model="zoom"
      :zoom="zoom"
      :center="center"
    >
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <span
        v-for="event in events"
        :key="event.id"
      >
        <LMarker
          v-if="event.location"
          :lat-lng="[event.location.lat, event.location.lng]"
        >
          <LPopup>
            <span class="popup-title">{{ event.title }}</span>
            <span class="popup-campaign">{{ event.campaign.title }}</span>
            <span class="popup-date">{{
              new Date(event.startDate).toLocaleString()
            }}</span>
            <router-link :to="`/events/${event.id}`">
              <Button class="p-button button-red"> Mitmachen/Infos </Button>
            </router-link>
          </LPopup>
        </LMarker>
      </span>
    </LMap>
  </div>
</template>

<script lang="ts">
import 'leaflet/dist/leaflet.css'
import { defineComponent } from 'vue'
import AutoComplete from "primevue/autocomplete";
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
  // @ts-ignore
} from '@vue-leaflet/vue-leaflet'
import { EventDto } from '@/api/model/EventDto';
import { CampaignDto } from '@/api/model/CampaignDto';

export default defineComponent({
  name: 'Home',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    AutoComplete
  },
  data() {
    return {
      zoom: 6,
      iconWidth: 25,
      iconHeight: 40,
      center: [51.5, 10],
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
    async getEvents() {
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
      this.events = await response.json()
    },
    async getCampaigns() {
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`)
      this.campaigns = await response.json()
    },
    searchCampaign(event: any) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredCampaigns = [...this.campaigns]
        } else {
          this.filteredCampaigns = this.campaigns.filter((campaign: any) => {
            return campaign.title.toLowerCase().startsWith(event.query.toLowerCase())
          })
        }
      }, 250)
    },
    async filterEvents() {
      // TODO filter by backend!
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
      const events = await response.json()
      this.events = events
      if (this.campaign?.id) {
        this.events = this.events.filter((event) => {
          if (event.campaign && event.campaign.id) {
            return event.campaign.id == this.campaign?.id
          }
        })
      }
    }
  }
})

</script>

<style lang="scss" scoped>
.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1.1rem;
}

.popup-campaign {
  display: block;
  font-size: 1rem;
}
.popup-date {
  display: block;
  font-size: 1rem;
}

.map {
  height: 75vh;
  width: auto;
}
</style>
