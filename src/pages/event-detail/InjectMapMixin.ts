import { defineComponent, inject } from 'vue'
import { MapInject } from 'src/mapbox/Map.vue'
import mapboxgl from 'mapbox-gl'

export default defineComponent({
  computed: {
    map(): mapboxgl.Map | undefined {
      return inject(MapInject)?.value
    }
  }
})
