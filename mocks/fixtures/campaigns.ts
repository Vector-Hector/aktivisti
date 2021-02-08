import { CampaignDto } from '@/api/model/CampaignDto.ts'



export const sampleCampaigns: CampaignDto[] = [{
  id: 1,
  title: 'Bundestagswahl 2021',
  startDate: '2021-05-07T00:00+01:00',
  endDate: '2021-09-26T23:59+01:00',
  type: 1,
  organization: 1,
}, {
  id: 2,
  title: 'Landtagswahl BaWü 2021',
  startDate: '2021-01-15T00:00+01:00',
  endDate: '2021-03-14T23:59+01:00',
  type: 2,
  organization: 2,
}]
