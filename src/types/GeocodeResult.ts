import { Geometry } from 'geojson'

export interface GeocodeResultContext {
  id: string
  languade: string
  short_code: string
  text: string
  wikidata: string
}

export interface GeocodeResultProperties {
  wikidata: string
}

export interface GeocodeResult {
  id: string
  boundingBox: number[]
  center: number[]
  context: GeocodeResultContext[]
  geometry: Geometry
  language: string
  place_name: string
  place_type: string[]
  properties: GeocodeResultProperties
  relevance: number
  text: string
  type: string
}
