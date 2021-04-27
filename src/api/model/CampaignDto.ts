export enum CampaignLevel {
  SUB_ASSOCIATION = 'SUB_ASSOCIATION',
  STATE_ASSOCIATION = 'STATE_ASSOCIATION',
  FEDERAL = 'FEDERAL'
}

export interface CampaignDto {
  id: number
  name: string
  start_date: string
  end_date: string
  campaign_type: number
  campaign_level: CampaignLevel
  sub_association: number | null
  state_association: number | null
}
