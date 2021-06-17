<template>
  <QPage class="event-map">
    <div class="map-container">
      <Map
        :bounding-box="bbox"
        ref="map"
        map-style="mapbox://styles/mapbox/streets-v11"
        @update:boundingBox="setBbox($event)"
      >
        <router-view
          v-slot="{ Component }"
          name="map"
        >
          <component
            :is="Component"
          />
        </router-view>
      </Map>
    </div>
    <ResizableBottomSheet
      :title="$route.meta.title?.()"
      @changed-size="resizeMap"
      :class="{
        'absolute-sheet': bottomSheetState === BottomSheetState.EXPANDED
      }"
    >
      <router-view />
    </ResizableBottomSheet>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ResizableBottomSheet from 'components/ResizableBottomSheet.vue'
import Map from 'src/mapbox/Map.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { userStore } from 'src/store/UserStore'
import { QPage } from 'quasar'
import { BottomSheetState, uiStore } from 'src/store/UiStore'

export default defineComponent({
  name: 'EventMap',
  components: {
    Map,
    ResizableBottomSheet,
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
.map-container {
  width: 100%;
  position: relative;
  flex: 1;
  flex-direction: column;
  display: flex;
}

.event-map {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.absolute-sheet {
  position: absolute;
}
</style>
