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
import InjectMapMixin from 'src/pages/event-detail/InjectMapMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { Geometry } from 'geojson'
import { center as turfCenter } from '@turf/turf'
import { LocationDto } from 'src/api/model/LocationDto'
import AddressMarker from 'src/map/AddressMarker.vue'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import EventAreaStreetMixin from 'pages/event-map/detail/area/street/EventAreaStreetMixin'

export default defineComponent({
  name: 'EventAreaStreetMap',
  components: { AddressMarker },
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
    async jumpToAddress(address: AddressDetails) {
      await this.$router.replace({
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
