<script lang="ts">
import { defineComponent, inject } from 'vue'
import { Geometry } from 'geojson'
import { useEditEventGeometryMixin } from 'pages/edit-event/geometry/EditEventGeometryMixin'
import { center as turfCenter } from '@turf/turf'
import { MapInject } from 'src/map/Map.vue'
import { AddressDetails } from 'src/api/model/AreaDetailsDto'
import { LocationDto } from 'src/api/model/LocationDto'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'
import AddressMarkerLayer from 'src/map/AddressMarkerLayer'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'
import EventMarker from 'components/EventMarker.vue'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'

export default defineComponent({
  name: 'EditEventDetailsMap',
  components: {
    EventMarker,
    PosterMarkerLayer,
    AddressMarkerLayer,
    AreaFeatureLayer
  },
  setup() {
    const { posters, event, eventAreas } = useEditEventMixin()
    const { features } = useEditEventGeometryMixin()
    const map = inject(MapInject)
    return {
      posters,
      event,
      eventAreas,
      features,
      map
    }
  },
  computed: {
    addresses(): AddressDetails[] | undefined {
      return this.eventAreas
        .map(({ area_details }) => area_details?.streets ?? [])
        .flat()
        .map(({ addresses }) => addresses)
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

<template>
  <AreaFeatureLayer :features="features" />
  <AddressMarkerLayer :addresses="addresses" />
  <PosterMarkerLayer :posters="posters" :editable="false" :opacity="0.5" />
  <EventMarker v-if="event?.location" :event="event" />
</template>
