import { Location } from '@/api/model/Location'
import { MetricDto } from '@/api/model/MetricDto'
import { CampaignDto } from '@/api/model/CampaignDto'


export interface EventDto {
  id: number,
  title: string,
  metrics: MetricDto[],
  campaign: CampaignDto,
  startDate: string,
  endDate: string,
  location: Location,
  description: string,
  participants: number[],
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
  location: Location,
  description: string,
  participants: number[],
  maxParticipants: number,
  public: boolean
}
