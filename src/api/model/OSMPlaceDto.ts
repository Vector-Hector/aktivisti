import { Geometry } from 'geojson'

export interface OSMPlaceDto {
  osm_id: number
  class: string
  address: string
  geometry: Geometry
}

