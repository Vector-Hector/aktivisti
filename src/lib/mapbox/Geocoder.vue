<template>
  <div
    ref="geocodeWrapper"
    class="geocode-wrapper"
  />
</template>
<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue'
//@ts-ignore
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { GeocodeResult } from '@/types/GeocodeResult'

export default defineComponent({
  name: 'Geocoder',
  props: {
    accessToken: {
      type: String as PropType<string>,
      required: true
    },
    countries: {
      type: Array as PropType<string[]> | null,
      default: null
    }
  },
  emits: {
    result(payload: GeocodeResult) {
      return payload
    }
  },
  setup(props, { emit }) {
    const geocodeControl = new MapboxGeocoder({
      accessToken: props.accessToken,
      countries: props.countries.join(',')
    })
    const geocodeWrapper = ref<HTMLElement | null>(null)
    geocodeControl.on('result', ({ result }: { result: GeocodeResult }) => {
      emit('result', result)
    })
    onMounted(() => {
      geocodeControl.addTo(geocodeWrapper.value)
    })

    return {
      geocodeWrapper
    }
  }
})

</script>
<style lang="scss" scoped>
@import "~@/scss/_color.scss";

.popup {
  padding: 6px 3px 0 3px;
}

</style>
