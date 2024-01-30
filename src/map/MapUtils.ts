import { inject, Ref } from 'vue'
import maplibregl from 'maplibre-gl'
import { TinyEmitter } from 'tiny-emitter'
import { MapKey } from 'src/types/keys'

export const MAP_PAN_TO = 'MAP_PAN_TO'
export const MAP_GEOLOCATE_STOP_TRACKING = 'MAP_GEOLOCATE_STOP_TRACKING'
export const MapEventBus = new TinyEmitter()

export function useMap(): Ref<maplibregl.Map> {
  const map = inject(MapKey)
  if (!map?.value) {
    throw new Error('useMap is only allowed in map contexts')
  } else {
    return map as Ref<maplibregl.Map>
  }
}
