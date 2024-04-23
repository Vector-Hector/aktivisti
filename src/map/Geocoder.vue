<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue'
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder'
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css'
import { forwardGeocode, reverseGeocode } from 'src/utils/map'
import { GeocodeResult } from 'src/types/GeocodeResult'
import maplibregl, { MarkerOptions } from 'maplibre-gl'
import { MapKey } from 'src/types/keys'

interface Props {
  countries?: string[] | null
  markerOptions?: MarkerOptions | boolean
  reverseGeocode?: boolean
  standalone?: boolean
  collapsed?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}
const props = withDefaults(defineProps<Props>(), {
  countries: null,
  markerOptions: undefined,
  reverseGeocode: false,
  standalone: false,
  collapsed: false,
  position: 'top-right'
})

interface Emits {
  (e: 'result', result: GeocodeResult): void
}
const emit = defineEmits<Emits>()

const geocodeControl = new MaplibreGeocoder(
  {
    forwardGeocode: forwardGeocode,
    reverseGeocode: reverseGeocode
  },
  {
    collapsed: props.collapsed,
    countries: props.countries?.join(',') ?? undefined,
    marker: props.markerOptions,
    placeholder: 'Suchen',
    showResultsWhileTyping: true,
    maplibregl: maplibregl
  }
)
const geocodeWrapper = ref<HTMLElement | null>(null)
geocodeControl.on('result', ({ result }: { result: GeocodeResult }) => {
  emit('result', result)
})

onMounted(() => {
  if (!props.standalone) {
    const map = inject(MapKey)
    if (!map?.value) {
      throw Error(
        'Either mount the Geocoder as a child of Map or set standalone=true'
      )
    }
    map?.value.addControl(geocodeControl, props.position)
  } else {
    geocodeControl.addTo(geocodeWrapper.value)
  }
})

onUnmounted(() => {
  if (!props.standalone) {
    const map = inject(MapKey)
    map?.value?.removeControl(geocodeControl)
  }
})
</script>

<template>
  <div v-if="standalone" ref="geocodeWrapper" class="geocode-wrapper" />
</template>

<style lang="scss" scoped>
@import 'src/css/variables.scss';

.popup {
  padding: 6px 3px 0 3px;
}
</style>
