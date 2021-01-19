import { LocationDto } from '@/api/model/LocationDto'
import { MetricDto } from '@/api/model/MetricDto'
import { CampaignDto } from '@/api/model/CampaignDto'
import { UserDto } from '@/api/model/UserDto'


export interface EventDto {
  id: number,
  title: string,
  metrics: MetricDto[],
  campaign: CampaignDto,
  startDate: string,
  endDate: string,
  location: LocationDto,
  description: string,
  participants: UserDto[],
  maxParticipants: number,
  public: boolean
}


export interface CreateEventDto {
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
