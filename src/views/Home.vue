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
  </div>
  <Map
    :center="center"
    map-style="mapbox://styles/mapbox/streets-v11"
  >
    <Marker
      v-for="event in events"
      :key="event.id"
      :location="event.location"
    >
      <Popup>
        <div class="popup-contents">
          <span class="popup-title">{{ event.title }}</span>
          <span class="popup-campaign">{{ event.campaign.title }}</span>
          <span class="popup-date">
            {{ new Date(event.startDate).toLocaleString() }}
          </span>
          <router-link
            class="join-link"
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

export default defineComponent({
  name: 'Home',
  components: {
    Popup,
    Map,
    Marker,
    AutoComplete
  },
  data() {
    return {
      zoom: 6,
      iconWidth: 25,
      iconHeight: 40,
      center: {lat: 51.5, lng: 10},
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
