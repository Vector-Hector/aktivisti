<template>
  <div
    class="drop-container"
    @drop="onDrop"
    @dragover.prevent
  >
    <div
      :id="mapUuid"
      ref="mapContainer"
      class="map"
    >
      <slot v-if="initialized" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, InjectionKey, onMounted, PropType, provide, Ref, ref, watch } from 'vue'
import mapboxgl, { LngLat, Point } from 'mapbox-gl'
import { LocationDto } from 'src/api/model/LocationDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { TinyEmitter } from 'tiny-emitter'
import { isEqual } from 'lodash-es'
import { uuidv4 } from 'src/utils/uuid'


export const MapInject: InjectionKey<Ref<mapboxgl.Map>> = Symbol()
export const MapEventBus = new TinyEmitter()

export const MAP_PAN_TO = 'MAP_PAN_TO'
export const MAP_GEOLOCATE_STOP_TRACKING = 'MAP_GEOLOCATE_STOP_TRACKING'

export default defineComponent({
  name: 'Map',
  props: {
    center: {
      type: Object as PropType<LocationDto | undefined>,
      required: false,
      default: () => {
        return {lng: 10.727275, lat: 51.109919}  // center of germany
      }
    },
    animate: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: true
    },
    zoom: {
      type: Number as PropType<number>,
      default: 5
    },
    zoomBox: {
      type: Array as unknown as PropType<BBox2d>,
      required: false,
      default: undefined
    },
    boundingBox: {
      type: Array as unknown as PropType<BBox2d>,
      default: () => [5.98865807458, 47.3024876979, 15.0169958839, 54.983104153] // bbox germany
    }
  },
  emits: ['update:zoom', 'update:center', 'update:zoom', 'drop', 'update:boundingBox'],
  setup(props, {emit}) {
    const mapUuid = `map-${uuidv4()}`
    mapboxgl.accessToken = process.env.APP_MAPBOX_TOKEN as string
    const map = ref<mapboxgl.Map | null>(null)
    const mapContainer = ref<HTMLElement | null>(null)
    const initialized = ref(false)
    provide(MapInject, map)

    const fitBounds = (...args: any) => {
      map.value?.fitBounds(args, {animate: props.animate})
    }

    const getBoundingBox = () => {
      return map.value!.getBounds().toArray().flat()
    }

    const emitWithBus = (type: string, event: any) => {
      // @ts-ignore
      emit(type, event)
      MapEventBus.emit(type, event)
    }
    onMounted(() => {
      map.value = new mapboxgl.Map({
        container: mapUuid,
        style: process.env.APP_MAPBOX_STYLE,
        zoom: props.zoom,
        center: props.center,
        bounds: props.boundingBox
      })
      map.value.on('load', () => {
        map.value?.resize()
        if (props.zoomBox) {
          map.value?.fitBounds(props.zoomBox, {padding: 10})
        }
        initialized.value = true

        watch(() => props.center, (newCenter, oldCenter) => {
          if (!newCenter || isEqual(newCenter, oldCenter)) return
          map.value?.setCenter([newCenter.lng, newCenter.lat])
        })

        watch(() => props.zoom, (newZoom) => {
          map.value?.setZoom(newZoom, {animate: props.animate})
        })

        watch(() => props.zoomBox, (newBox) => {
          if (newBox) {
            map.value?.fitBounds(newBox, {padding: 20, animate: props.animate})
          }
        }, {immediate: true})

        watch(() => props.boundingBox, (newBox) => {
          if (newBox) {
            map.value?.fitBounds(newBox, {animate: props.animate})
          }
        })

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

    const onDrop = (event: any) => {
      const rect = mapContainer.value!.getBoundingClientRect()
      const cursorPosition = new Point(
        event.clientX - rect.left - mapContainer.value!.clientLeft,
        event.clientY - rect.top - mapContainer.value!.clientTop
      )
      emitWithBus('drop', {
        originalEvent: event,
        coordinates: map.value!.unproject(cursorPosition)
      })
    }

    return {
      map,
      mapUuid,
      onDrop,
      initialized,
      mapContainer,
      fitBounds
    }
  }
})

</script>
<style lang="scss" scoped>
.map {
  width: 100%;
}

.drop-container {
  flex: 1;
  order: 1;
  display: flex;
  height: 100%;
}
</style>
