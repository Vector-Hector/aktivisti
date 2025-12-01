<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { useInjectMapMixin } from 'src/pages/event-detail/InjectMapMixin'
import EventMarker from 'components/EventMarker.vue'
import { cloneDeep, isEqual } from 'lodash-es'
import { useEventStore } from 'src/stores/event'
import { LngLat } from 'maplibre-gl'
import CoordinatesPopup from 'src/map/popup/CoordinatesPopup.vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import EventAreaPopupContents from 'src/map/popup/EventAreaPopupContents.vue'
import { useRouter } from 'vue-router'
import { EventTypes } from 'src/api/model/EventTypes'

const router = useRouter()
const eventStore = useEventStore()
const { map } = useInjectMapMixin()

const clickCoordinates = ref<LngLat>(null)
const clickedEventArea = ref<EventAreaDto>(null)

onMounted(() => {
  map.value?.fitBounds(eventStore.zoomBox as BBox2d, { animate: false })
})

const zoomBoxCopy = computed(() => {
  return cloneDeep(eventStore.zoomBox)
})

watch(
  zoomBoxCopy,
  (newValue, oldValue) => {
    if (newValue !== null && !isEqual(newValue, oldValue)) {
      map.value?.fitBounds(newValue as BBox2d)
    }
  },
  { deep: true }
)

function handleEventAreaClick(areaId: number, lngLat: LngLat) {
  clickedEventArea.value = eventStore.eventAreas.find(
    (area) => area.id === areaId
  )
  clickCoordinates.value = lngLat
}

function handleGoToArea() {
  if (
    [EventTypes.DOOR_TO_DOOR, EventTypes.FLYERS].includes(
      eventStore.event.event_type
    )
  ) {
    void router.push({
      name: 'event-detail-area',
      params: {
        eventId: eventStore.event.id,
        areaId: clickedEventArea.value.id
      }
    })
  }
  if (eventStore.event.event_type === EventTypes.POSTERS) {
    void router.push({
      name: 'event-detail-poster',
      params: {
        eventId: eventStore.event.id,
        areaId: clickedEventArea.value.id
      }
    })
  }
}
</script>

<template>
  <EventMarker v-if="eventStore.event?.location" :event="eventStore.event" />
  <AreaFeatureLayer
    :features="eventStore.areaFeatures"
    @on-event-area-click="handleEventAreaClick"
  />
  <CoordinatesPopup
    v-if="clickedEventArea && clickedEventArea"
    :key="`${clickCoordinates.lng}-${clickCoordinates.lat}`"
    :coordinates="clickCoordinates.toArray()"
    :has-offset="false"
  >
    <EventAreaPopupContents
      :event-area="clickedEventArea"
      @on-go-to-area="handleGoToArea"
      :event-type="eventStore.event.event_type"
    />
  </CoordinatesPopup>
</template>

<style lang="scss" scoped></style>
