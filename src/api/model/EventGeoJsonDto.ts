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
    event_type: EventTypes
    campaigns: number[]
    sub_association: number
    can_edit_participants: boolean
    can_edit: boolean
  }
}

export interface EventGeoJsonDto {
  type: 'FeatureCollection'
  features: Array<EventGeoJsonFeature>
}
