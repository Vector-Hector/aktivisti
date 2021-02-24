<template>
  <Geocoder
    ref="geocoder"
    :marker-options="false"
    :countries="['de']"
    :access-token="accessToken"
    :reverse-geocode="true"
    @result="updateMarker"
  />
  <MapOverlay
    position="top-left"
  >
    <h1 class="headline">
      Ort auswählen
    </h1>
    <p>Wähle ein Ort über das Suchfeld auf der rechten Seite aus aus</p>
  </MapOverlay>
  <Marker
    v-if="event.location?.center"
    :draggable="true"
    :location="event.location.center"
    @update:location="updateGeocoder"
  />
  <MapOverlay
    class="navigation-overlay"
    position="bottom-right"
  >
    <router-link
      v-slot="{ href, navigate }"
      custom
      :to="{name: 'edit-event-details'}"
    >
      <Button
        class="gray-button"
        @click="navigate"
      >
        <a :href="href">
          Zurück
        </a>
      </Button>
    </router-link>
    <router-link
      v-slot="{ href, navigate }"
      custom
      :to="{name: 'edit-event-routes'}"
    >
      <Button
        :disabled="!event.location"
        class="submit-button"
        @click="navigate"
      >
        <a :href="href">
          Routen zeichnen
        </a>
      </Button>
    </router-link>
  </MapOverlay>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Geocoder from '@/lib/mapbox/Geocoder.vue'
import Marker from '@/lib/mapbox/Marker.vue'
import { LocationDto } from '@/api/model/LocationDto'
import { GeocodeResult } from '@/types/GeocodeResult'
import MapOverlay from '@/components/MapOverlay.vue'
import Button from 'primevue/components/button/Button'
import EditEventMixin from '@/views/edit-event/EditEventMixin'
import { mapboxPlaceDtoFromGeocodeResult } from '@/api/model/MapboxPlaceDto'


export default defineComponent({
  name: 'EditEventMapLocation',
  components: {
    MapOverlay,
    Marker,
    Geocoder,
    Button
  },
  mixins: [EditEventMixin],
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN
    }
  },
  methods: {
    updateMarker(geocoderResult: GeocodeResult) {
      this.event.location = mapboxPlaceDtoFromGeocodeResult(geocoderResult)
    },
    updateGeocoder(location: LocationDto) {
      (this.$refs.geocoder as typeof Geocoder).query(`${location.lat},${location.lng}`)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@/scss/_map.scss";
@import "~@/scss/_variables.scss";


Button {
  a {
    color: $white;
    text-decoration: none;
  }
}

.submit-button {
  margin-left: 1rem;
}

.headline {
  margin: 0;
}

</style>
