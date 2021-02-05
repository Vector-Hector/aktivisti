import { LocationDto } from '@/api/model/LocationDto'
import { Geometry } from 'geojson'
import { GeocodeResult } from '@/types/GeocodeResult'

export interface MapboxPlaceDto {
  mapbox_id: string
  name: string
  center: LocationDto
  geometry: Geometry
}

export function mapboxPlaceDtoFromGeocodeResult(result: GeocodeResult): MapboxPlaceDto {
  return {
    mapbox_id: result.id,
    name: result.place_name,
    center: {
      lng: result.center[0],
      lat: result.center[1]
    },
    geometry: result.geometry
  }
}
