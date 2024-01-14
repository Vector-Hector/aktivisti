<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { MapEventBus } from './Map.vue'
import { FitBoundsOptions, LngLat, PositionOptions } from 'maplibre-gl'
import { ionLocation, ionRadioButtonOnSharp } from '@quasar/extras/ionicons-v5'
import { Geolocation, Position } from '@capacitor/geolocation'
import {
  matGpsFixed,
  matGpsNotFixed,
  matGpsOff
} from '@quasar/extras/material-icons'
import { QFab, QFabAction, QIcon } from 'quasar'
import Marker from 'src/map/Marker.vue'
import { MAP_GEOLOCATE_STOP_TRACKING, useMap } from 'src/map/Map.vue'
import { LocationDto } from 'src/api/model/LocationDto'

interface GeolocateControlOptions {
  positionOptions?: PositionOptions
  fitBoundsOptions?: FitBoundsOptions
  trackUserLocation?: boolean
  showAccuracyCircle?: boolean
  showUserLocation?: boolean
}

enum GeolocateState {
  TRACKING,
  ENABLED,
  DISABLED,
  UNAVAILABLE
}

interface Props {
  showMarker?: boolean
  poiLocation: LocationDto
  options?: GeolocateControlOptions
  locatorIconFixed?: string
  locatorIconNotFixed?: string
  locatorIconOff?: string
}

interface Emits {
  (e: 'position', position: LocationDto | undefined): void
}

const props = withDefaults(defineProps<Props>(), {
  showMarker: true,
  options: () => {
    return {}
  },
  locatorIconFixed: matGpsFixed,
  locatorIconNotFixed: matGpsNotFixed,
  locatorIconOff: matGpsOff
})
const emit = defineEmits<Emits>()

const locatorState = ref<GeolocateState>(GeolocateState.DISABLED)
const locationWatcher = ref<null | string>(null)
const userPosition = ref<LngLat | null>(null)
const touchListener = ref<(() => void) | null>(null)

const map = useMap()

onMounted(() => {
  touchListener.value = () => {
    if (locatorState.value === GeolocateState.TRACKING) {
      locatorState.value = GeolocateState.ENABLED
    }
  }
  MapEventBus.on(MAP_GEOLOCATE_STOP_TRACKING, touchListener.value)
  map.value.on('dragstart', touchListener.value)
})

const isGeolocationServiceUnavailable = computed(
  () => GeolocateState.UNAVAILABLE === locatorState.value
)
const locatorIcon = computed(() => {
  switch (locatorState.value) {
    case GeolocateState.ENABLED:
      return props.locatorIconNotFixed
    case GeolocateState.DISABLED:
      return props.locatorIconNotFixed
    case GeolocateState.TRACKING:
      return props.locatorIconFixed
    case GeolocateState.UNAVAILABLE:
    default:
      return props.locatorIconOff
  }
})

const locatorColor = computed(() => {
  switch (locatorState.value) {
    case GeolocateState.TRACKING:
    case GeolocateState.ENABLED:
      return 'primary'
    case GeolocateState.UNAVAILABLE:
      return 'grey-8'
    case GeolocateState.DISABLED:
    default:
      return '#000000'
  }
})

watch(locatorState, (newState) => {
  switch (newState) {
    case GeolocateState.ENABLED:
    case GeolocateState.TRACKING:
      void startWatch()
      break
  }
})

onUnmounted(() => {
  if (touchListener.value) {
    MapEventBus.off(MAP_GEOLOCATE_STOP_TRACKING, touchListener.value)
    map.value.off('dragstart', touchListener.value)
  }
  stopWatch()
})

function onLocateClicked(position: LocationDto | undefined, tracking = false) {
  if (tracking) {
    switch (locatorState.value) {
      case GeolocateState.ENABLED:
      case GeolocateState.DISABLED:
        locatorState.value = GeolocateState.TRACKING
        break
    }
  } else {
    MapEventBus.emit(MAP_GEOLOCATE_STOP_TRACKING)
  }
  if (position) {
    map.value.panTo(position)
    emit('position', position)
  }
}
async function startWatch() {
  if (!locationWatcher.value) {
    locationWatcher.value = await Geolocation.watchPosition(
      {},
      (position, err) => updatePosition(position, err)
    )
  }
}
function stopWatch() {
  if (locationWatcher.value) {
    void Geolocation.clearWatch({ id: locationWatcher.value })
  }
}
function updatePosition(position: Position | null, error: any) {
  if (error) {
    locatorState.value = GeolocateState.UNAVAILABLE
    return
  }
  if (position?.coords === undefined) {
    return
  }
  userPosition.value = new LngLat(
    position.coords.longitude,
    position.coords.latitude
  )

  if (locatorState.value === GeolocateState.TRACKING) {
    map.value.panTo(userPosition.value)
    emit('position', userPosition.value)
  }
}
</script>
<template>
  <Marker v-if="showMarker && userPosition" :location="userPosition">
    <template v-slot:marker>
      <QIcon :name="ionRadioButtonOnSharp" color="primary" class="pulse" />
    </template>
  </Marker>
  <div class="geolocation-control">
    <QFab
      :icon="locatorIcon"
      :color="locatorColor"
      direction="left"
      class="geolocation-control-button"
      padding="sm"
      flat
      round
    >
      <QFabAction
        :icon="locatorIconFixed"
        external-label
        label-position="bottom"
        :disable="isGeolocationServiceUnavailable"
        :color="locatorColor"
        label="Standort"
        flat
        round
        @click="onLocateClicked(userPosition, true)"
        class="geolocation-control-button"
      />
      <QFabAction
        v-if="poiLocation"
        @click="onLocateClicked(poiLocation, false)"
        external-label
        label-position="bottom"
        :icon="ionLocation"
        label="Aktion"
        flat
        round
        class="geolocation-control-button"
      />
    </QFab>
  </div>
</template>

<style lang="scss">
.pulse {
  font-size: 24px;
  animation: pulse-animation 2s infinite;
  border-radius: 50%;
  box-shadow: 0 0 1px 1px #0000001a;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 12px rgba(0, 0, 0, 0);
  }
}

.geolocation-control-button {
  background: white;
  box-shadow: $map-overlay-shadow;
}
</style>
