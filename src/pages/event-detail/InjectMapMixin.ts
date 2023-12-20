import { computed, defineComponent, inject } from 'vue'
import { MapInject } from 'src/map/Map.vue'

/**
 * @deprecated Please use `useInjectMapMixin()` in combination with composition api.
 */
export default defineComponent({
  name: 'InjectMapMixin',
  computed: {
    map: () => inject(MapInject)?.value
  }
})

export function useInjectMapMixin() {
  const map = computed(() => inject(MapInject)?.value)
  return { map }
}
