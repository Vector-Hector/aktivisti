<template>
  <div
    v-if="standalone"
    ref="geocodeWrapper"
    class="geocode-wrapper"
  />
</template>
<script lang="ts">
import { defineComponent, inject, onMounted, onUnmounted, PropType, ref } from 'vue'
//@ts-ignore
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder'
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css'
import { forwardGeocode, reverseGeocode } from 'src/utils/mapbox'
import { GeocodeResult } from 'src/types/GeocodeResult'
import { MapInject } from 'src/mapbox/Map.vue'
import maplibregl, { MarkerOptions } from 'maplibre-gl'

export default defineComponent({
  name: 'Geocoder',
  props: {
    countries: {
      type: Array as PropType<string[]> | null,
      default: null
    },
    markerOptions: {
      type: Object as PropType<MarkerOptions | boolean>,
      required: false,
      default: undefined
    },
    reverseGeocode: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    },
    standalone: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    },
    collapsed: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false
    },
    position: {
      type: String as PropType<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>,
      default: 'top-right'
    }
  },
  emits: {
    result(payload: GeocodeResult) {
      return payload
    }
  },
  setup(props, {emit}) {
    const geocodeControl = new MaplibreGeocoder({
      forwardGeocode: forwardGeocode,
      reverseGeocode: reverseGeocode,
    }, {
      collapsed: props.collapsed,
      countries: props.countries?.join(',') ?? undefined,
      marker: props.markerOptions,
      placeholder: 'Suchen',
      showResultsWhileTyping: true,
      maplibregl: maplibregl
    })
    const geocodeWrapper = ref<HTMLElement | null>(null)
    geocodeControl.on('result', ({result}: { result: GeocodeResult }) => {
      emit('result', result)
    })

    onMounted(() => {
      if (!props.standalone) {
        const map = inject(MapInject)
        if (!map?.value) {
          throw Error('Either mount the Geocoder as a child of Map or set standalone=true')
        }
        map?.value.addControl(geocodeControl, props.position)
      } else {
        geocodeControl.addTo(geocodeWrapper.value)
      }
    })

    onUnmounted(() => {
      if (!props.standalone) {
        const map = inject(MapInject)
        map?.value?.removeControl(geocodeControl)
      }
    })

    return {
      geocodeWrapper,
      query: (input: string) => geocodeControl.query(input)
    }
  }
})

</script>
<style lang="scss" scoped>
@import "src/css/variables.scss";

.popup {
  padding: 6px 3px 0 3px;
}

</style>
