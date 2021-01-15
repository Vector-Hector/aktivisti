import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'


export interface CampaignDto {
  id: number,
  title: string,
  type: CampaignTypeDto,
  organization: null
}

export interface CreateCampaignDto {
  id: number,
  title: string,
  type: number,
  organization: null
}
