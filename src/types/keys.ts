import { InjectionKey, Ref } from 'vue'
import type { Map } from 'maplibre-gl'

export const MapKey = Symbol() as InjectionKey<Ref<Map | null>>
