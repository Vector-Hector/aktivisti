import { Location } from '@/model/Location'

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
