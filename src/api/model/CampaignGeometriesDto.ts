import { Geometry } from 'geojson'

export interface CampaignGeometriesDto {
  id: number,
  geometry_collection: number,
  metadata: any,
  geometry: Geometry
}
