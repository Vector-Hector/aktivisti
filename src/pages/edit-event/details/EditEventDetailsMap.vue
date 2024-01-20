<script setup lang="ts">
import { computed, inject } from 'vue'
import { Geometry } from 'geojson'
import { useEditEventGeometryMixin } from 'pages/edit-event/geometry/EditEventGeometryMixin'
import { center as turfCenter } from '@turf/turf'
import { MapInject } from 'src/map/Map.vue'
import { LocationDto } from 'src/api/model/LocationDto'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'
import AddressMarkerLayer from 'src/map/AddressMarkerLayer'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'
import EventMarker from 'components/EventMarker.vue'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'

const { posters, event, eventAreas } = useEditEventMixin()
const { features } = useEditEventGeometryMixin()

const addresses = computed(() => {
  return eventAreas.value
    .map(({ area_details }) => area_details?.streets ?? [])
    .flat()
    .map(({ addresses }) => addresses)
    .flat()
})
</script>

<template>
  <AreaFeatureLayer :features="features" />
  <AddressMarkerLayer :addresses="addresses" />
  <PosterMarkerLayer :posters="posters" :editable="false" :opacity="0.5" />
  <EventMarker v-if="event?.location" :event="event" />
</template>
