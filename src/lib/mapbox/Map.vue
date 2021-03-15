<template>
  <div
    id="map"
    ref="mapContainer"
    class="map"
  >
    <slot v-if="initialized" />
  </div>
</template>
<script lang="ts">
import { defineComponent, provide, InjectionKey, PropType, ref, Ref, onMounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import { LocationDto } from '@/api/model/LocationDto'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'


export const MapInject: InjectionKey<Ref<mapboxgl.Map>> = Symbol()

export default defineComponent({
  name: 'Map',
  props: {
    center: {
      type: Object as PropType<LocationDto>,
      required: true
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
  emits: ['update:zoom', 'update:center', 'update:zoom'],
  setup(props, {emit}) {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN
    const map = ref<mapboxgl.Map | null>(null)
    const mapContainer = ref<HTMLElement | null>(null)
    const initialized = ref(false)
    provide(MapInject, map)

    watch(() => props.center, (newCenter) => {
      if (!newCenter) return
      map.value?.setCenter([newCenter.lng, newCenter.lat])
    })

    watch(() => props.zoom, (newZoom) => {
      map.value?.setZoom(newZoom)
    })

    watch(() => props.zoomBox, (newBox) => {
      if (newBox) {
        map.value?.fitBounds(newBox, {padding: 20})
      }
    }, {immediate: true})

    const fitBounds = (...args: any) => {
      map.value?.fitBounds(args)
    }

    onMounted(() => {
      map.value = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ctrlaltcoop/ckk88gdh90jle17nn8y76dp36',
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
      map.value.on('zoom', () => {
        emit('update:zoom', map.value?.getZoom())
      })
      map.value.on('moveend', () => {
        emit('update:center', map.value?.getCenter())
      })

      map.value.on('zoomend', () => {
        emit('update:zoom', map.value?.getZoom())
      })
    })
    return {
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
</style>
