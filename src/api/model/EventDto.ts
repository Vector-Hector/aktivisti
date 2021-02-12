import { EventTypes } from '@/api/model/EventTypes'
import { MapboxPlaceDto } from '@/api/model/MapboxPlaceDto'


export interface EventDto {
  id: number,
  type: EventTypes
  title: string,
  metrics: number[],
  campaign: number,
  startDate: string,
  endDate: string,
  location: MapboxPlaceDto,
  published: boolean,
  description: string,
  participants: number[],
  maxParticipants: number,
  public: boolean
}
