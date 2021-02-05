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
import { defineComponent, provide, InjectionKey, PropType, ref, Ref, onMounted, nextTick } from 'vue'
import mapboxgl from 'mapbox-gl'
import { LocationDto } from '@/api/model/LocationDto'


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
    }
  },
  emits: ['update:zoom'],
  setup(props, { emit }) {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_TOKEN
    const map = ref<mapboxgl.Map | null>(null)
    const mapContainer = ref<HTMLElement | null>(null)
    const initialized = ref(false)
    provide(MapInject, map)
    onMounted(() => {
      map.value = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/ctrlaltcoop/ckk88gdh90jle17nn8y76dp36',
        center: [props.center.lng, props.center.lat],
        zoom: props.zoom
      })
      map.value.on('load', () => {
        map.value?.resize()
        initialized.value = true
      })
      map.value.on('zoom', () => {
        emit('update:zoom', map.value?.getZoom())
      })
    })
    return {
      initialized,
      mapContainer
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
