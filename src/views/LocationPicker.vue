<template>
  <h1>Wähle einen Treffpunkt aus</h1>

  <div class="map">
    <l-map
      v-model="zoom"
      :zoom="zoom"
      :center="center"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ></l-tile-layer>

      <l-marker ref="marker" :lat-lng="[52, 13]" draggable>
      </l-marker>

    </l-map>
    <button @click="submit">Submit</button>
  </div>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LMarker,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
        zoom: 6,
        iconWidth: 25,
        iconHeight: 40,
        center: [51.5, 10],
    };
  },
  computed: {
  },
  methods: {
    submit() {
      let location = {
        lat: this.$refs.marker.leafletObject._latlng.lat,
        lng: this.$refs.marker.leafletObject._latlng.lng
      }
      console.log(location)
      this.$router.push(`/events/new`)
    },
  },
};
</script>

<style lang="scss" scoped>
    .map {
        height: 75vh;
        width: auto;
    }
</style>