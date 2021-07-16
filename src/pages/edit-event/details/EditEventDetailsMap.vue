<template>
  <FeatureLayer
    :features="features"
  />
  <AddressMarkerLayer
    :addresses="addresses"
  />
  <Marker
    v-if="event.location"
    :location="event.location"
  />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'
import Marker from 'src/mapbox/Marker.vue'
import { Feature, Geometry } from 'geojson'
import EditEventGeometryMixin from 'pages/edit-event/geometry/EditEventGeometryMixin'
import { center as turfCenter } from '@turf/turf'
import InjectMapMixin from 'pages/event-detail/InjectMapMixin'
import { MapInject } from 'src/mapbox/Map.vue'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import { LocationDto } from 'src/api/model/LocationDto'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer'
import AddressMarkerLayer from 'src/mapbox/AddressMarkerLayer'


export default defineComponent({
  name: 'EditEventDetailsMap',
  components: {
    AddressMarkerLayer,
    Marker,
    FeatureLayer
  },
  setup() {
    const map = inject(MapInject)
    return {
      map
    }
  },
  mixins: [EditEventGeometryMixin, InjectMapMixin],
  computed: {

    features(): Feature[] {
      return this.eventAreas.map((area) => {
        return {
          type: 'Feature',
          geometry: area.geometry,
          id: area.feature_id,
          properties: {
            // find the corresponding area and copy the color
            color: area.color
          }
        }
      })
    },
    addresses(): AddressDetails[] | undefined {
      return this.eventAreas
        .map(({area_details}) => area_details?.streets ?? [])
        .flat()
        .map(({addresses}) => addresses)
        .flat()
    }
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

