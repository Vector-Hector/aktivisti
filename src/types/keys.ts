import { InjectionKey, Ref } from 'vue/dist/vue'
import maplibregl from 'maplibre-gl'

export const MapKey: InjectionKey<Ref<maplibregl.Map | null>> = Symbol()
