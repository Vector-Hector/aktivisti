<template>
  <h1>Wähle einen Treffpunkt aus</h1>

  <div style="height: 75vh; width: 50vw">
    <l-map
      v-model="zoom"
      :zoom="zoom"
      :center="center"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ></l-tile-layer>

      <l-marker :lat-lng="[52, 13]" draggable @dragend="getLatLng" >
      </l-marker>

    </l-map>
    <button @click="changeIcon">Submit</button>
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
    changeIcon() {
        console.log(this)
    },
    getLatLng() {
        console.log(this)
        console.log(event.latLngSync)
        console.log(event.target.getLatLng())
        // e.target.getLatLng().lng;

    }
  },
};
</script>