import { AreaDetailsDto } from 'src/api/model/AreaDetailsDto'
import { Feature, Geometry } from 'geojson'


export interface EventAreaDto {
  id?: number
  name: string
  color: string
  event: number
  feature_id: string
  geometry: Geometry
  is_completed: boolean
  area_details?: AreaDetailsDto
  poster_count: number
  poster_creation_allowed: boolean
}

export function eventAreaToFeature(eventArea: EventAreaDto): Feature {
  return {
    type: 'Feature',
    id: eventArea.feature_id,
    geometry: eventArea.geometry,
    properties: {
      color: eventArea.color
    }
  }
}
