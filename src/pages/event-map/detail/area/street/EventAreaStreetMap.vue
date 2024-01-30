<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { useInjectMapMixin } from 'src/pages/event-detail/InjectMapMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { Geometry } from 'geojson'
import { center as turfCenter } from '@turf/turf'
import { LocationDto } from 'src/api/model/LocationDto'
import AddressMarker from 'src/map/AddressMarker.vue'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import { useEventAreaStreetComposable } from 'pages/event-map/detail/area/street/EventAreaStreetMixin'

export default defineComponent({
  name: 'EventAreaStreetMap',
  props: {
    street: {
      type: String as PropType<string>,
      required: true
    },
    areaId: {
      type: String as PropType<string>,
      required: true
    }
  },
  components: { AddressMarker },
  setup(props) {
    const { addresses, bbox } = useEventAreaStreetComposable(props)
    const { map } = useInjectMapMixin()
    return { addresses, bbox, map }
  },
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
