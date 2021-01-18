export interface CampaignTypeDto {
  id: string,
  name: string
}

export interface CampaignDto {
  id: string,
  title: string,
  type: CampaignTypeDto,
  organization: CampaignOrganizationDto
}

export interface OrganizationTypeDto {
  code: string,
  name: string
}

export interface CampaignOrganizationDto {
  id: number,
  name: string
}
