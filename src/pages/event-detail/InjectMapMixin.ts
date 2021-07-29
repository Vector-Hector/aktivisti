import { defineComponent, inject } from 'vue'
import { MapInject } from 'src/mapbox/Map.vue'

export default defineComponent({
  name: 'InjectMapMixin',
  computed: {
    map: () => inject(MapInject)?.value
  }
})
