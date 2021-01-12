<template>
  <h1>Finde Veranstaltungen in deiner Nähe</h1>

  <div class="map">
    <LMap
        v-model="zoom"
        :zoom="zoom"
        :center="center"
    >
      <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ></LTileLayer>

      <span v-for="event in events" :key="event.id">
        <LMarker v-if="event.location" :lat-lng="[event.location.lat, event.location.lng]">
           <LPopup>
             <span class="popup-title">{{ event.title }}</span>
             <span class="popup-campaign">{{ event.campaign.title }}</span>
             <span class="popup-date">{{ new Date(event.startDate).toLocaleString() }}</span>
             <router-link :to="`/events/${event.id}`">
               <Button class="p-button button-red">
               Mitmachen/Infos
             </Button>
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

import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup
  // @ts-ignore
} from '@vue-leaflet/vue-leaflet'

export default defineComponent({
  name: 'Home',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup
  },
  data() {
    return {
      zoom: 6,
      iconWidth: 25,
      iconHeight: 40,
      center: [51.5, 10],
      events: [] as Event[]
    }
  },
  created() {
    this.getEvents()
  },
  methods: {
    async getEvents() {
      const response = await fetch(`${process.env.VUE_APP_BASE_URL}/api/events`)
      this.events = await response.json()
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
