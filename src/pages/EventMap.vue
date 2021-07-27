<template>
  <QPage class="event-map">
    <MapContainer>
      <Map
        :bounding-box="bbox"
        ref="map"
        @update:boundingBox="setBbox($event)"
      >
        <GeolocationControl />
        <router-view
          v-slot="{ Component }"
          name="map"
        >
          <component
            :is="Component"
          />
        </router-view>
      </Map>
      <MapOverlayProxy
        :title="$route.meta.title?.()"
        @changed-size="resizeMap"
      >
        <div class="overlay-content">
          <router-view />
        </div>
      </MapOverlayProxy>
    </MapContainer>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MapOverlayProxy from 'components/MapOverlayProxy.vue'
import Map from 'src/mapbox/Map.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { userStore } from 'src/store/UserStore'
import { QPage } from 'quasar'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import GeolocationControl from 'src/mapbox/GeolocationControl.vue'
import MapContainer from 'components/MapContainer.vue'

export default defineComponent({
  name: 'EventMap',
  components: {
    GeolocationControl,
    MapContainer,
    Map,
    MapOverlayProxy,
    QPage
  },
  data() {
    return {
      bbox: userStore.getState().bbox,
      BottomSheetState
    }
  },
  computed: {
    mapRef(): InstanceType<typeof Map> | undefined {
      return this.$refs.map as InstanceType<typeof Map> | undefined
    },
    bottomSheetState(): BottomSheetState {
      return uiStore.getState().bottomSheetState
    }
  },
  methods: {
    resizeMap(newSheetSize: BottomSheetState) {
      if (newSheetSize !== BottomSheetState.EXPANDED) {
        this.mapRef?.map?.resize()
      }
    },
    setBbox(value: BBox2d) {
      userStore.setBbox(value)
    }
  }
})
</script>

<style lang="scss" scoped>

.overlay-content {
  height: 100%;
  display: flex;
}

.event-map {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: hidden;
}

</style>
