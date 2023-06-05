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

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue'
import { MapEventBus, MapInject } from './Map.vue'
import { FitBoundsOptions, LngLat, PositionOptions } from 'maplibre-gl'
import {
  ionLocateOutline,
  ionLocation,
  ionRadioButtonOnSharp
} from '@quasar/extras/ionicons-v5'
import { Geolocation, Position } from '@capacitor/geolocation'
import {
  matGpsFixed,
  matGpsNotFixed,
  matGpsOff
} from '@quasar/extras/material-icons'
import { QFab, QFabAction, QIcon } from 'quasar'
import Marker from 'src/map/Marker.vue'
import { MAP_GEOLOCATE_STOP_TRACKING } from 'src/map/Map.vue'
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

export default defineComponent({
  name: 'GeolocationControl',
  components: {
    Marker,
    QIcon,
    QFab,
    QFabAction
  },
  props: {
    showMarker: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    poiLocation: {
      type: Object as PropType<LocationDto>,
      required: false
    },
    options: {
      type: Object as PropType<GeolocateControlOptions>,
      default: function () {
        return {}
      }
    },
    locatorIconFixed: {
      type: String as PropType<string>,
      default: matGpsFixed
    },
    locatorIconNotFixed: {
      type: String as PropType<string>,
      default: matGpsNotFixed
    },
    locatorIconOff: {
      type: String as PropType<string>,
      default: matGpsOff
    }
  },
  emits: ['position'],
  setup() {
    const map = inject(MapInject)!
    return {
      map
    }
  },
  data() {
    return {
      ionLocation,
      ionLocateOutline,
      locatorState: GeolocateState.DISABLED as GeolocateState,
      locationWatcher: null as null | string,
      userPosition: null as LngLat | null,
      touchListener: null as (() => void) | null,
      ionRadioButtonOnSharp
    }
  },

  computed: {
    isGeolocationServiceUnavailable(): boolean {
      return GeolocateState.UNAVAILABLE === this.locatorState
    },
    locatorIcon(): string {
      switch (this.locatorState) {
        case GeolocateState.ENABLED:
          // @ts-ignore type inference broken
          return this.locatorIconNotFixed
        case GeolocateState.DISABLED:
          // @ts-ignore type inference broken
          return this.locatorIconNotFixed
        case GeolocateState.TRACKING:
          // @ts-ignore type inference broken
          return this.locatorIconFixed
        case GeolocateState.UNAVAILABLE:
        default:
          // @ts-ignore type inference broken
          return this.locatorIconOff
      }
    },
    locatorColor(): string {
      switch (this.locatorState) {
        case GeolocateState.TRACKING:
        case GeolocateState.ENABLED:
          return 'primary'
        case GeolocateState.UNAVAILABLE:
          return 'grey-8'
        case GeolocateState.DISABLED:
        default:
          return '#000000'
      }
    }
  },
  methods: {
    onLocateClicked(position: LocationDto | undefined, tracking = false) {
      if (tracking) {
        switch (this.locatorState) {
          case GeolocateState.ENABLED:
          case GeolocateState.DISABLED:
            this.locatorState = GeolocateState.TRACKING
            break
        }
      } else {
        MapEventBus.emit(MAP_GEOLOCATE_STOP_TRACKING)
      }
      if (position) {
        this.map.panTo(position)
        this.$emit('position', position)
      }
    },
    async startWatch() {
      if (!this.locationWatcher) {
        this.locationWatcher = await Geolocation.watchPosition(
          {},
          (position, err) => this.updatePosition(position, err)
        )
      }
    },
    stopWatch() {
      if (this.locationWatcher) {
        void Geolocation.clearWatch({ id: this.locationWatcher })
      }
    },
    updatePosition(position: Position | null, error: any) {
      if (error) {
        this.locatorState = GeolocateState.UNAVAILABLE
        return
      }
      if (position?.coords === undefined) {
        return
      }
      this.userPosition = new LngLat(
        position.coords.longitude,
        position.coords.latitude
      )

      if (this.locatorState === GeolocateState.TRACKING) {
        this.map.panTo(this.userPosition)
        this.$emit('position', this.userPosition)
      }
    }
  },
  mounted() {
    this.touchListener = () => {
      if (this.locatorState === GeolocateState.TRACKING) {
        this.locatorState = GeolocateState.ENABLED
      }
    }
    MapEventBus.on(MAP_GEOLOCATE_STOP_TRACKING, this.touchListener)
    this.map.on('dragstart', this.touchListener)
  },
  unmounted() {
    if (this.touchListener) {
      MapEventBus.off(MAP_GEOLOCATE_STOP_TRACKING, this.touchListener)
      this.map.off('dragstart', this.touchListener)
    }
    this.stopWatch()
  },
  watch: {
    locatorState(newState) {
      switch (newState) {
        case GeolocateState.ENABLED:
        case GeolocateState.TRACKING:
          void this.startWatch()
          break
      }
    }
  }
})
</script>
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
