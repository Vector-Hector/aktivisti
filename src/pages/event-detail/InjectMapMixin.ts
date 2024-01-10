import { computed, inject } from 'vue'
import { MapInject } from 'src/map/Map.vue'

export function useInjectMapMixin() {
  const map = computed(() => inject(MapInject)?.value)
  return { map }
}
