import { EventTypes } from 'src/api/model/EventTypes'

export interface EventGeoJsonFeature {
  id: number
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    name: string
    start_date: string
    end_date: string
    location_description: string
    event_type: EventTypes
  }
}

export interface EventGeoJsonDto {
  type: 'FeatureCollection'
  features: Array<EventGeoJsonFeature>
}
