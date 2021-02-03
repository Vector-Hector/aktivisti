import { LocationDto } from '@/api/model/LocationDto'


export interface EventDto {
  id: number,
  title: string,
  metrics: number[],
  campaign: number,
  startDate: string,
  endDate: string,
  location: LocationDto,
  description: string,
  participants: number[],
  maxParticipants: number,
  public: boolean
}
