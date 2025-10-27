<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import maplibregl, { LngLat } from 'maplibre-gl'
import { LocationDto } from 'src/api/model/LocationDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { isEqual } from 'lodash-es'
import { uuidv4 } from 'src/utils/uuid'
import { SettleDebouncer } from 'src/utils/debounce'
import { MAP_PAN_TO, MapEventBus } from 'src/map/MapUtils'
import { MapKey } from 'src/types/keys'

interface Props {
  center?: LocationDto | undefined
  animate?: boolean
  zoom?: number
  zoomBox?: BBox2d
  boundingBox?: BBox2d
  interactive?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  center: () => {
    // center of germany
    return { lng: 10.727275, lat: 51.109919 }
  },
  animate: true,
  zoom: 5,
  zoomBox: undefined,
  // bbox germany
  boundingBox: () => [
    5.98865807458, 47.3024876979, 15.0169958839, 54.983104153
  ],
  interactive: true
})

interface Emits {
  (e: 'update:zoom', zoom: number): void
  (e: 'update:center', center: maplibregl.LngLat): void
  (
    e: 'drop',
    event: { originalEvent: any; coordinates: maplibregl.LngLat }
  ): void
  (e: 'update:boundingBox', boundingBox: number[]): void
}
const emit = defineEmits<Emits>()

const mapUuid = `map-${uuidv4()}`
const map = ref<maplibregl.Map | null>(null)
const mapContainer = ref<HTMLElement | null>(null)
const initialized = ref(false)
provide(MapKey, map)

const getBoundingBox = () => {
  return map.value!.getBounds().toArray().flat()
}

const emitWithBus = (type: string, event: any) => {
  // @ts-ignore
  emit(type, event)
  MapEventBus.emit(type, event)
}

const resizeDebouncer = new SettleDebouncer()

const resizeMap = () => {
  void resizeDebouncer.executeDebounced(() => {
    map.value?.resize()
    return Promise.resolve()
  }, 100)
}

onMounted(() => {
  window.addEventListener('resize', resizeMap)
  map.value = new maplibregl.Map({
    container: mapUuid,
    style: process.env.APP_MAP_STYLE,
    zoom: props.zoom,
    center: props.center,
    bounds: props.boundingBox,
    interactive: props.interactive,
    // for now we are disabling any rotating and pitching interaction
    touchPitch: false,
    dragRotate: false,
    pitchWithRotate: false
  })
  map.value.on('load', () => {
    map.value?.resize()
    if (props.zoomBox) {
      map.value?.fitBounds(props.zoomBox, { padding: 10 })
    }
    initialized.value = true

    watch(
      () => props.center,
      (newCenter, oldCenter) => {
        if (!newCenter || isEqual(newCenter, oldCenter)) return
        map.value?.setCenter([newCenter.lng, newCenter.lat])
      }
    )

    watch(
      () => props.zoom,
      (newZoom) => {
        map.value?.setZoom(newZoom, { animate: props.animate })
      }
    )

    watch(
      () => props.zoomBox,
      (newBox) => {
        if (newBox) {
          map.value?.fitBounds(newBox, {
            padding: 20,
            animate: props.animate
          })
        }
      },
      { immediate: true }
    )

    watch(
      () => props.boundingBox,
      (newBox) => {
        if (newBox) {
          map.value?.fitBounds(newBox, { animate: props.animate })
        }
      }
    )

    MapEventBus.on(MAP_PAN_TO, (location: LngLat) => {
      map.value?.panTo(location)
    })
  })
  map.value.on('moveend', () => {
    emitWithBus('update:center', map.value?.getCenter())
    emitWithBus('update:boundingBox', getBoundingBox())
  })

  map.value.on('zoomend', () => {
    emitWithBus('update:zoom', map.value?.getZoom())
    emitWithBus('update:boundingBox', getBoundingBox())
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeMap)
})

const onDrop = (event: any) => {
  const rect = mapContainer.value!.getBoundingClientRect()
  const cursorPosition: [number, number] = [
    event.clientX - rect.left - mapContainer.value!.clientLeft,
    event.clientY - rect.top - mapContainer.value!.clientTop
  ]
  emitWithBus('drop', {
    originalEvent: event,
    coordinates: map.value!.unproject(cursorPosition)
  })
}

defineExpose({ map })
</script>

<template>
  <div
    class="drop-container"
    @drop.prevent.stop="onDrop"
    @dragover.prevent.stop
  >
    <div :id="mapUuid" ref="mapContainer" class="map">
      <div class="top-right-overlay">
        <slot v-if="initialized" name="top-right" />
      </div>
      <slot v-if="initialized" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map {
  width: 100%;
}

.drop-container {
  flex: 1;
  order: 1;
  display: flex;
}

.top-right-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}
</style>
