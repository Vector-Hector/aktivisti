<template>
  <div
    class="drop-container"
    @drop="onDrop"
    @dragover.prevent
  >
    <div
      id="map"
      ref="mapContainer"
      class="map"
    >
      <slot v-if="initialized" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, provide, InjectionKey, PropType, ref, Ref, onMounted, watch } from 'vue'
import mapboxgl, { Point } from 'mapbox-gl'
import { LocationDto } from '@/api/model/LocationDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { TinyEmitter } from 'tiny-emitter'
import { isEqual } from 'lodash-es'
import { bboxPolygon } from '@turf/turf'


export const MapInject: InjectionKey<Ref<mapboxgl.Map>> = Symbol()
export const MapEventBus = new TinyEmitter()

export default defineComponent({
  name: 'Map',
  props: {
    center: {
      type: Object as PropType<LocationDto>,
      required: true
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
      type: Object as PropType<BBox2d>,
      required: false,
      default: undefined
    }
  },
  emits: ['update:zoom', 'update:center', 'update:zoom', 'drop', 'update:boundingBox'],
  setup(props, {emit}) {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN
    const map = ref<mapboxgl.Map | null>(null)
    const mapContainer = ref<HTMLElement | null>(null)
    const initialized = ref(false)
    provide(MapInject, map)

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

    const fitBounds = (...args: any) => {
      map.value?.fitBounds(args, {animate: props.animate})
    }

    const getBoundingBox = () => {
      const bounds = map.value!.getBounds()
      return bboxPolygon([
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast(),
        bounds.getSouth()
      ])
    }

    const emitWithBus = (type: string, event: any) => {
      // @ts-ignore
      emit(type, event)
      MapEventBus.emit(type, event)
    }
    onMounted(() => {
      map.value = new mapboxgl.Map({
        container: 'map',
        style: process.env.VUE_APP_MAPBOX_STYLE,
        zoom: props.zoom,
        center: props.center
      })
      map.value.on('load', () => {
        map.value?.resize()
        if (props.zoomBox) {
          map.value?.fitBounds(props.zoomBox, {padding: 10})
        }
        initialized.value = true
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
  height: 100%;
  width: 100%;
}

.drop-container {
  flex: 1;
}
</style>
