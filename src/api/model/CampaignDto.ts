import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { CampaignOrganizationDto } from '@/api/model/CampaignOrganizationDto'

export interface CampaignDto {
  id: number,
  title: string,
  type: CampaignTypeDto,
  organization: CampaignOrganizationDto
}

export interface CreateCampaignDto {
  id: number,
  title: string,
  type: number,
  organization: number
}
