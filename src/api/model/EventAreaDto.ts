import { AreaDetailsDto } from '@/api/model/AreaDetailsDto'
import { Geometry } from 'geojson'


export interface EventAreaDto {
  id?: number
  name: string
  color: string
  event: number,
  feature_id: string,
  geometry: Geometry
  area_details?: AreaDetailsDto
}
