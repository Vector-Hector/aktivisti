import { CampaignDto } from '@/api/model/CampaignDto.ts'

export const sampleCampaigns: Partial<CampaignDto>[] = [{
  id: 1,
  title: 'Bundestagswahl 2021',
  type: {
    name: 'Wahlkampf',
    id: 1
  },
  organization: {
    name: 'Bund',
    id: 1
  },
}, {
  id: 2,
  title: 'Landtagswahl BaWü 2021',
  type: {
    name: 'Organizing',
    id: 2
  },
  organization: {
    name: 'Land',
    id: 2
  },
}]
