import { LocationDto } from '@/api/model/LocationDto'

export interface ClusterDto {
  cluster_id: number
  count: number
  centroid: LocationDto
}
