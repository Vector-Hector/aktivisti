import { Location } from '@/model/Location'
import { MetricDto } from '@/model/MetricDto'
import { CampaignDto } from '@/model/CampaignDto'

export interface EventDto {
  id: string,
  title: string,
  metrics: MetricDto[],
  campaign: CampaignDto,
  startDate: Date,
  endDate: Date,
  location: Location,
  description: string,
  participants: number,
  maxParticipants: number,
  public: boolean
}
