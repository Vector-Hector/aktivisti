<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import Geocoder from 'src/map/Geocoder.vue'
import { userStore } from 'src/store/UserStore'
import { officeOverviewStore } from 'src/store/OfficeOverviewStore'
import { apiClient } from 'src/api/ApiClient'
import {
  OfficeGeoJsonDto,
  OfficeGeoJsonFeature
} from 'src/api/model/OfficeGeoJsonDto'
import { loadImageIfNonExistent } from 'src/utils/map'
import CoordinatesPopup from 'src/map/popup/CoordinatesPopup.vue'
import OfficePopupContents from 'src/map/popup/OfficePopupContents.vue'
import EventLayer from 'src/map/EventLayer.vue'
import { useMap } from 'src/map/MapUtils'

const activeOffice = ref<null | OfficeGeoJsonFeature>()
const map = useMap()
const bounds = ref(userStore.getState().bbox)
const officeFeatureCollection = ref<OfficeGeoJsonDto | null>(null)

onMounted(() => {
  void apiClient.officeGeometry.list().then((offices) => {
    officeFeatureCollection.value = offices.payload.data
  })
})

const updateBounds = () => {
  const currentBbox = map.value?.getBounds().toArray().flat() as BBox2d
  bounds.value = currentBbox
  officeOverviewStore.state.bbox = currentBbox
}

map.value.on('zoomend', updateBounds)
map.value.on('moveend', updateBounds)

void loadImageIfNonExistent(
  map.value,
  'office',
  '/static/icons/map-pin-office.png'
)

onUnmounted(() => {
  map.value.off('zoomend', updateBounds)
  map.value.off('moveend', updateBounds)
})
updateBounds()
</script>
<template>
  <Geocoder :collapsed="true" position="top-left" :countries="['de']" />

  <EventLayer
    v-if="officeFeatureCollection"
    :feature-collection="officeFeatureCollection"
    :icon-image-value="'office'"
    @feature-clicked="activeOffice = $event"
  />
  <CoordinatesPopup
    v-if="activeOffice"
    :coordinates="activeOffice.geometry.coordinates"
    @close="activeOffice = null"
  >
    <OfficePopupContents v-if="activeOffice" :office="activeOffice">
    </OfficePopupContents>
  </CoordinatesPopup>
</template>
