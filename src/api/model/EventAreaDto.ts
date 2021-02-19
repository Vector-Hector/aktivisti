import { AreaDetailsDto } from '@/api/model/AreaDetailsDto'
import { Feature } from 'geojson'


export interface EventAreaDto {
  id?: number
  name: string
  color: string
  event: number
  feature: Feature
  area_details?: AreaDetailsDto
}
