<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  setIsMapDefined(value: boolean): void
}
export default {
  beforeRouteEnter(to, from, next) {
    const componentsOfMostPrecisePath =
      to.matched[to.matched.length - 1].components
    const isMapDefined =
      componentsOfMostPrecisePath && 'map' in componentsOfMostPrecisePath
    uiStore.setBottomSheetStateAtLeast(BottomSheetState.HALF)
    next((vm) => {
      ;(vm as IInstance).setIsMapDefined(isMapDefined || false)
    })
  }
}
</script>

<script setup lang="ts">
import { ComponentPublicInstance, computed, ref } from 'vue'
import MapOverlayProxy from 'components/MapOverlayProxy.vue'
import Map from 'src/map/Map.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { userStore } from 'src/store/UserStore'
import { QPage } from 'quasar'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import GeolocationControl from 'src/map/GeolocationControl.vue'
import MapContainer from 'components/MapContainer.vue'
import { eventDetailStore } from 'src/store/EventDetailStore'
import ResetRotateControl from 'src/map/ResetRotateControl.vue'
import CampaignCollectionOverlayControl from 'src/map/CampaignCollectionOverlayControl.vue'
import { getAuthStore } from 'src/store/AuthStore'
import { onBeforeRouteUpdate } from 'vue-router'
import { useI18n } from 'vue-i18n'

interface Props {
  showCreateButton?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showCreateButton: false
})

const map = ref<InstanceType<typeof Map> | null>(null)
const { t } = useI18n()

const bbox = ref(userStore.getState().bbox)
const isMapDefined = ref(true)
const isLoggedIn = ref(getAuthStore().isLoggedIn())

onBeforeRouteUpdate((to, from, next) => {
  const componentsOfMostPrecisePath =
    to.matched[to.matched.length - 1].components
  isMapDefined.value =
    (componentsOfMostPrecisePath && 'map' in componentsOfMostPrecisePath) ||
    false
  next()
})

const poiLocation = computed(() => {
  return eventDetailStore.state.event?.location
})
const mapRef = computed(() => {
  return map.value as InstanceType<typeof Map> | undefined
})

function resizeMap(newSheetSize: BottomSheetState) {
  if (newSheetSize !== BottomSheetState.EXPANDED) {
    mapRef.value?.map?.resize()
  }
}
function setBbox(value: BBox2d) {
  userStore.setBbox(value)
}

function setIsMapDefined(value: boolean) {
  isMapDefined.value = value
}

defineExpose({ setIsMapDefined })
</script>

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
      <MapOverlayProxy
        :title="$route.meta.title?.(t)"
        @changed-size="resizeMap"
        :showCreateButton="props.showCreateButton"
      >
        <router-view />
      </MapOverlayProxy>
    </MapContainer>
    <router-view v-else />
  </QPage>
</template>

<style lang="scss" scoped>
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
