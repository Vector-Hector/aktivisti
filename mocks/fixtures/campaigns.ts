import { CampaignDto } from '@/api/model/CampaignDto.ts'

export const sampleCampaigns: Partial<CampaignDto>[] = [{
  id: 1,
  title: 'Bundestagswahl 2021',
  type: {
    name: 'Bund',
    id: 1
  },
  organization: null
}, {
  id: 2,
  title: 'Landtagswahl BaWü 2021',
  type: {
    name: 'Land',
    id: 2
  },
  organization: null
}]
