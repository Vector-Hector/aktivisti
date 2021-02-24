import { Geometry } from 'geojson'
import { AreaDetailsDto } from '@/api/model/AreaDetailsDto'


export interface OperationAreaDto {
  id: number
  geometry: Geometry
  assigned_users: number[]
  area_details: AreaDetailsDto
}
