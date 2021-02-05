<template>
  <h1>Routeneditor</h1>
  <Map
    :center="center"
    :zoom="15"
  >
    <DrawControl />

  </Map>
</template>


<script lang="ts">
import { defineComponent } from 'vue'
import Map from '../lib/mapbox/Map.vue'
import DrawControl from '@/lib/mapbox/DrawControl.vue'

export default defineComponent({
  name: 'RouteEditor',
  components: {
    DrawControl,
    Map
  },
  data() {
    return {
      center: {lat: 52.520008, lng: 13.404954}
    }
  },
  created() {
  },
  methods: {}
})
</script>


<style lang="scss" scoped>

</style>
