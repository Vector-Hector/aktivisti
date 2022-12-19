import { defineComponent, inject } from 'vue'
import { MapInject } from 'src/map/Map.vue'

export default defineComponent({
  name: 'InjectMapMixin',
  computed: {
    map: () => inject(MapInject)?.value
  }
})
