import { LocationDto } from 'src/api/model/LocationDto'

export interface ClusterDto {
  cluster_id: number
  count: number
  centroid: LocationDto
}
