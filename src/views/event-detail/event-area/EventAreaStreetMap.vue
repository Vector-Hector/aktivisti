<template>
  <AddressMarker
    v-for="address in addresses"
    :key="address.house_number"
    :location="center(address.geometry)"
    :text="address.house_number"
    :selected="$route.params.houseNumber === address.house_number"
    @click="jumpToAddress(address)"
  />
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import InjectMapMixin from '@/views/event-detail/InjectMapMixin'
import EventAreaStreetMixin from '@/views/event-detail/event-area/EventAreaStreetMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { Geometry } from 'geojson'
import { center as turfCenter } from '@turf/turf'
import { LocationDto } from '@/api/model/LocationDto'
import AddressMarker from '@/lib/mapbox/AddressMarker.vue'
import { AddressDetails } from '@/api/model/AreaDetailsDto'

export default defineComponent({
  name: 'EventAreaStreetMap',
  components: {AddressMarker},
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
    },
    jumpToAddress(address: AddressDetails) {
      this.$router.replace({
        name: 'event-detail-area-metrics',
        params: {
          houseNumber: address.house_number,
          street: this.street
        }
      })
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
