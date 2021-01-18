import { CampaignDto } from '@/api/model/CampaignDto.ts'

export const sampleCampaigns: Partial<CampaignDto>[] = [{
  id: 1,
  title: 'Bundestagswahl 2021',
  type: {
    name: 'Wahlkampf',
    id: 0
  },
  organization: {
    name: 'Bund',
    id: 0
  },
}, {
  id: 2,
  title: 'Landtagswahl BaWü 2021',
  type: {
    name: 'Organizing',
    id: 1
  },
  organization: {
    name: 'Land',
    id: 1
  },
}]
