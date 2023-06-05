import { Polygon } from 'geojson'
import { PosterMount, PosterStatus } from 'src/api/model/PosterDto'

export interface PosterFilterParams {
  event?: number
  mounted_on?: PosterMount
  status?: PosterStatus
  area?: number
  sub_association?: number[]
  campaigns?: number[]
  within?: Polygon
}
