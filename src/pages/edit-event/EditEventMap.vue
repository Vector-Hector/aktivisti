<template>
  <Map
    ref="map"
    :center="initialCenter"
    :zoom="initialZoom"
  >
    <router-view
      v-model:event="localEvent"
      :campaigns="campaigns"
    />
  </Map>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from 'src/mapbox/Map.vue'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import { booleanPointInPolygon, polygon } from '@turf/turf'
import mapboxgl from 'mapbox-gl'


export default defineComponent({
  name: 'EditEventMap',
  components: {
    Map
  },
  mixins: [EditEventMixin],
  data() {
    return {
      initialCenter: this.event.location ?? {
        lat: 51.1642292,
        lng: 10.4541194
      },
      initialZoom: this.event.location ? 14 : 11
    }
  },
  watch: {
    'event.location': {
      handler(newValue) {
        // check if the new location is still inside the bounds of the visual map - if not we should jump to it

        // @ts-ignore
        const map = this.$refs.map.map as mapboxgl.Map
        // if not initialized return
        if (!map || !newValue) return
        const bounds = map.getBounds()
        const boundsGeometry = polygon([
          [
            [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
            [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
            [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
            [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
            [bounds.getNorthWest().lng, bounds.getNorthWest().lat]
          ]
        ])
        if (!booleanPointInPolygon([newValue.lng, newValue.lat], boundsGeometry)) {
          this.initialCenter = newValue
        }
      },
      deep: true
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
