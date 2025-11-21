import { EventTypes } from './EventTypes'

export interface CampaignGeometryCollectionsDto {
  name: string
  id: number
  campaign: number
  color: string
  event_types: EventTypes[]
  import_errors: string[]
}
