import { EventTypes } from '@/api/model/EventTypes'
import { LocationDto } from '@/api/model/LocationDto'


export interface EventDto {
  id: number
  event_type: EventTypes
  name: string
  metrics: number[]
  campaigns: number[]
  start_date: string
  end_date: string
  location: LocationDto
  location_description: string
  published: boolean
  description: string
  participants: number[]
  max_participants: number
}
