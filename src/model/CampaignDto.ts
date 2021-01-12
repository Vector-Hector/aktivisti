export interface CampaignTypeDto {
  id: string,
  name: string
}

export interface CampaignDto {
  id: string,
  title: string,
  type: CampaignTypeDto,
  organization: null
}

