import { defineComponent, inject } from 'vue'
import { MapInject } from '@/lib/mapbox/Map.vue'
import mapboxgl from 'mapbox-gl'

export default defineComponent({
  computed: {
    map(): mapboxgl.Map | undefined {
      return inject(MapInject)?.value
    }
  }
})
