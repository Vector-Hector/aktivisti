<template>
  <Marker
    v-for="address in addresses"
    :key="address.house_number"
    :location="center(address.geometry)"
  >
    <template #marker>
      <i class="marker-icon">{{ address.house_number }}</i>
    </template>
  </Marker>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import Marker from '@/lib/mapbox/Marker.vue'
import InjectMapMixin from '@/views/event-detail/InjectMapMixin'
import EventAreaStreetMixin from '@/views/event-detail/event-area/EventAreaStreetMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { Geometry } from 'geojson'
import { center as turfCenter } from '@turf/turf'
import { LocationDto } from '@/api/model/LocationDto'

export default defineComponent({
  name: 'EventAreaStreetMap',
  components: {Marker},
  mixins: [InjectMapMixin, EventAreaStreetMixin],
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  },
  methods: {
    center(geometry: Geometry): LocationDto {
      //@ts-ignore
      const point = turfCenter(geometry)
      return {
        lat: point.geometry.coordinates[1],
        lng: point.geometry.coordinates[0]
      }
    }
  }
})

</script>

<style lang="scss" scoped>
.marker-icon {
  border-radius: 999px;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 1.2;
  display: block;
  background: white;
  border: 1px solid red;
}
</style>
