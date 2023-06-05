import { Polygon } from 'geojson'

export interface OfficeFilterParams {
  within?: Polygon
  limit?: number
  sub_association?: number[]
  state_association?: number[]
}
