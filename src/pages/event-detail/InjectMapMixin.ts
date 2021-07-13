import { defineComponent, inject } from 'vue'
import { MapInject } from 'src/mapbox/Map.vue'

export default defineComponent({
  name: 'InjectMapMixin',
  setup() {
    return {
      map: inject(MapInject)?.value
    }
  }
})
