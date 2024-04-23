import { computed, inject } from 'vue'
import { MapKey } from 'src/types/keys'

export function useInjectMapMixin() {
  const map = computed(() => inject(MapKey)?.value)
  return { map }
}
