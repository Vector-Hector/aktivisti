import { EventTypes } from '@/api/model/EventTypes'
import { MapboxPlaceDto } from '@/api/model/MapboxPlaceDto'


export interface EventDto {
  id: number,
  event_type: EventTypes,
  name: string,
  metrics: number[],
  campaign: number,
  start_date: string,
  end_date: string,
  location: MapboxPlaceDto,
  published: boolean,
  description: string,
  participants: number[],
  max_participants: number,
  public: boolean
}
