import { CampaignDto, CampaignLevel } from '@/api/model/CampaignDto.ts'

export const sampleCampaigns: CampaignDto[] = [{
  id: 1,
  name: 'Bundestagswahl 2021',
  start_date: '2021-05-07T00:00+01:00',
  end_date: '2021-09-26T23:59+01:00',
  campaign_type: 1,
  campaign_level: CampaignLevel.FEDERAL,
  sub_association: null,
  state_association: null
}, {
  id: 2,
  name: 'Landtagswahl BaWü 2021',
  start_date: '2021-01-15T00:00+01:00',
  end_date: '2021-03-14T23:59+01:00',
  campaign_type: 2,
  campaign_level: CampaignLevel.STATE_ASSOCIATION,
  sub_association: null,
  state_association: 1
}]
