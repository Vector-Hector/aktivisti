<script setup lang="ts">
import { onBeforeMount, onUnmounted, onBeforeUnmount, ref } from 'vue'
import { useMap } from 'src/map/Map.vue'
import { eventOverviewStore } from 'src/store/EventOverviewStore'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import Geocoder from 'src/map/Geocoder.vue'
import { uiStore } from 'src/store/UiStore'
import { EventGeoJsonFeature } from 'src/api/model/EventGeoJsonDto'
import CoordinatesPopup from 'src/map/popup/CoordinatesPopup.vue'
import EventPopupContents from 'src/map/popup/EventPopupContents.vue'
import { loadImageIfNonExistent } from 'src/utils/map'
import { EventTypes } from 'src/api/model/EventTypes'
import EventLayer from 'src/map/EventLayer'
import { apiClient } from 'src/api/ApiClient'
import {
  OfficeGeoJsonDto,
  OfficeGeoJsonFeature
} from 'src/api/model/OfficeGeoJsonDto'
import OfficePopupContents from 'src/map/popup/OfficePopupContents.vue'

const POSTER_SYMBOL_NAME = EventTypes.POSTERS
const DOOR_TO_DOOR_SYMBOL_NAME = EventTypes.DOOR_TO_DOOR
const FLYER_SYMBOL_NAME = EventTypes.FLYERS
const GENERIC_SYMBOL_NAME = EventTypes.GENERIC

const MAX_ZOOM_LEVEL_OFFICES = 14

const map = useMap()

const activeEvent = ref<EventGeoJsonFeature | null>(null)
const activeOffice = ref<OfficeGeoJsonFeature | null>(null)
const offices = ref<OfficeGeoJsonDto | null>(null)
const showOffices = ref(false)

function zoomListener() {
  showOffices.value = map.value.getZoom() > MAX_ZOOM_LEVEL_OFFICES
}
map.value.on('zoomend', zoomListener)

onBeforeMount(async () => {
  const previousZoom = uiStore.getState().mapZoom
  if (previousZoom != null) {
    map.value.setZoom(previousZoom, {})
  }
  uiStore.setMapZoom(null)
  const officeResponse = await apiClient.officeGeometry.list()
  offices.value = officeResponse.payload.data
})

void loadImageIfNonExistent(
  map.value,
  POSTER_SYMBOL_NAME,
  '/static/icons/map-pin-poster.png'
)
void loadImageIfNonExistent(
  map.value,
  DOOR_TO_DOOR_SYMBOL_NAME,
  '/static/icons/map-pin-door.png'
)
void loadImageIfNonExistent(
  map.value,
  FLYER_SYMBOL_NAME,
  '/static/icons/map-pin-flyer.png'
)
void loadImageIfNonExistent(
  map.value,
  GENERIC_SYMBOL_NAME,
  '/static/icons/map-pin-generic.png'
)

void loadImageIfNonExistent(
  map.value,
  'office-gray',
  '/static/icons/map-pin-office-grayed-out.png'
)

const updateBounds = () => {
  eventOverviewStore.setBbox(map.value?.getBounds().toArray().flat() as BBox2d)
}
map.value.on('zoomend', updateBounds)
map.value.on('moveend', updateBounds)

updateBounds()

onBeforeUnmount(() => {
  uiStore.setMapZoom(map.value.getZoom())
})

onUnmounted(() => {
  map.value.off('zoomend', updateBounds)
  map.value.off('moveend', updateBounds)
  map.value.off('zoomend', zoomListener)
})
</script>
<template>
  <Geocoder :collapsed="true" position="top-left" :countries="['de']" />
  <EventLayer
    v-if="offices && showOffices"
    :clusterize="false"
    :feature-collection="offices"
    @feature-clicked="activeOffice = $event"
    :icon-image-value="'office-gray'"
  />
  <CoordinatesPopup
    v-if="activeOffice"
    :coordinates="activeOffice.geometry.coordinates"
    @close="activeOffice = null"
  >
    <OfficePopupContents v-if="activeOffice" :office="activeOffice">
    </OfficePopupContents>
  </CoordinatesPopup>

  <EventLayer
    v-if="eventOverviewStore.state.featureCollection"
    :feature-collection="eventOverviewStore.state.featureCollection"
    @feature-clicked="activeEvent = $event"
    :icon-image-value="['get', 'event_type']"
  />
  <CoordinatesPopup
    v-if="activeEvent"
    :coordinates="activeEvent.geometry.coordinates"
    @close="activeEvent = null"
  >
    <EventPopupContents v-if="activeEvent" :event="activeEvent">
    </EventPopupContents>
  </CoordinatesPopup>
</template>
<style lang="scss" scoped>
::v-global(.too-many-events-headline) {
  margin: 0;
}
</style>
