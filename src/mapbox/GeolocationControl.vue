<template>
  <Marker
    v-if="position"
    :location="position"
  >
    <template v-slot:marker>
      <QIcon
        :name="ionRadioButtonOnSharp"
        color="primary"
        class="pulse"
      />
    </template>
  </Marker>
  <div class="geolocation-control">
    <QBtn
      :icon="locatorIcon"
      flat
      round
      style="background: white"
      :color="locatorColor"
      @click="onLocateClicked"
    />

  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue'
import { MapEventBus, MapInject } from './Map.vue'
import { FitBoundsOptions, LngLat, PositionOptions } from 'mapbox-gl'
import { ionLocateOutline, ionRadioButtonOnSharp } from '@quasar/extras/ionicons-v5'
import { Geolocation, Position } from '@capacitor/geolocation'
import { matGpsFixed, matGpsNotFixed, matGpsOff } from '@quasar/extras/material-icons'
import { QBtn, QIcon } from 'quasar'
import Marker from 'src/mapbox/Marker.vue'
import { MAP_GEOLOCATE_STOP_TRACKING } from 'src/mapbox/Map.vue'


interface GeolocateControlOptions {
  positionOptions?: PositionOptions;
  fitBoundsOptions?: FitBoundsOptions;
  trackUserLocation?: boolean;
  showAccuracyCircle?: boolean;
  showUserLocation?: boolean;

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
    QBtn,
    QIcon
  },
  props: {
    options: {
      type: Object as PropType<GeolocateControlOptions>,
      default: function () {
        return {}
      }
    }
  },
  emits: ['locate', 'position'],
  setup() {
    const map = inject(MapInject)!
    return {
      map
    }
  },
  data() {
    return {
      ionLocateOutline,
      locatorState: GeolocateState.DISABLED as GeolocateState,
      locationWatcher: null as null | string,
      position: null as LngLat | null,
      touchListener: null as (() => void) | null,
      ionRadioButtonOnSharp
    }
  },

  computed: {
    locatorIcon(): string {
      switch (this.locatorState) {
      case GeolocateState.ENABLED:
        return matGpsNotFixed
      case GeolocateState.DISABLED:
        return matGpsNotFixed
      case GeolocateState.TRACKING:
        return matGpsFixed
      case GeolocateState.UNAVAILABLE:
      default:
        return matGpsOff
      }
    },
    locatorColor(): string {
      switch (this.locatorState) {
      case GeolocateState.TRACKING:
      case GeolocateState.ENABLED:
        return 'primary'
      case GeolocateState.DISABLED:
      case GeolocateState.UNAVAILABLE:
      default:
        return '#000000'
      }
    }
  },
  methods: {
    onLocateClicked() {
      switch (this.locatorState) {
      case GeolocateState.ENABLED:
      case GeolocateState.DISABLED:
        this.locatorState = GeolocateState.TRACKING
        break
      }
      if (this.position !== null) {
        this.map.panTo(this.position)
      }
      }
    },
    async startWatch() {
      if (!this.locationWatcher) {
        this.locationWatcher = await Geolocation.watchPosition({}, (position, err) => this.updatePosition(position, err))
      }
    },
    stopWatch() {
      if (this.locationWatcher) {
        void Geolocation.clearWatch({id: this.locationWatcher})
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
      this.position = new LngLat(position.coords.longitude, position.coords.latitude)

      if (this.locatorState === GeolocateState.TRACKING) {
        this.map.panTo(this.position)
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
.geolocation-control {
  z-index: 10;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

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


</style>
