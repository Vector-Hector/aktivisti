export interface OSMPlaceDto {
  place_id: string
  licence: string
  osm_type: string
  osm_id: number
  boundingbox: [number, number, number, number]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
}
