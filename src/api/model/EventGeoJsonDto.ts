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
    end_date: string | null
    location_description: string
    event_type: EventTypes
    campaigns: number[]
    sub_association: number
  }
}

export interface EventGeoJsonDto {
  type: 'FeatureCollection'
  features: Array<EventGeoJsonFeature>
}
