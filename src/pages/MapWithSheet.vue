<template>
  <QPage class="event-map">
    <MapContainer v-if="isMapDefined">
      <Map
        class="map"
        :bounding-box="bbox"
        ref="map"
        @update:boundingBox="setBbox($event)"
      >
        <template v-slot:top-right>
          <div class="flex column q-gutter-y-sm">
            <GeolocationControl :poi-location="poiLocation" />
            <CampaignCollectionOverlayControl v-if="isLoggedIn" />
            <ResetRotateControl />
          </div>
        </template>
        <router-view v-slot="{ Component }" name="map">
          <component :is="Component" />
        </router-view>
      </Map>
      <MapOverlayProxy :title="$route.meta.title?.()" @changed-size="resizeMap">
        <div class="overlay-content">
          <router-view />
        </div>
      </MapOverlayProxy>
    </MapContainer>
    <router-view v-else />
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MapOverlayProxy from 'components/MapOverlayProxy.vue'
import Map from 'src/map/Map.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { userStore } from 'src/store/UserStore'
import { QPage } from 'quasar'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import GeolocationControl from 'src/map/GeolocationControl.vue'
import MapContainer from 'components/MapContainer.vue'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { LocationDto } from 'src/api/model/LocationDto'
import ResetRotateControl from 'src/map/ResetRotateControl.vue'
import CampaignCollectionOverlayControl from 'src/map/CampaignCollectionOverlayControl.vue'
import { getAuthStore } from 'src/store/AuthStore'
import EventLayer from 'src/map/EventLayer'
import { OfficeGeoJsonDto } from 'src/api/model/OfficeGeoJsonDto'

export default defineComponent({
  name: 'MapWithSheet',
  components: {
    EventLayer,
    CampaignCollectionOverlayControl,
    ResetRotateControl,
    GeolocationControl,
    MapContainer,
    Map,
    MapOverlayProxy,
    QPage
  },
  data() {
    return {
      offices: null as OfficeGeoJsonDto | null,
      bbox: userStore.getState().bbox,
      BottomSheetState,
      isMapDefined: true,
      isLoggedIn: getAuthStore().isLoggedIn()
    }
  },
  beforeRouteEnter(to, from, next) {
    const isMapDefined = 'map' in to.matched[to.matched.length - 1].components
    uiStore.setBottomSheetStateAtLeast(BottomSheetState.HALF)
    next((vm) => {
      // @ts-ignore
      vm.isMapDefined = isMapDefined
    })
  },
  beforeRouteUpdate(to, from, next) {
    this.isMapDefined = 'map' in to.matched[to.matched.length - 1].components
    next()
  },
  computed: {
    poiLocation(): LocationDto | undefined {
      return eventDetailStore.state.event?.location
    },
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

.map {
  :deep(.maplibregl-ctrl-geocoder) {
    max-width: 75%;
  }
}
</style>
