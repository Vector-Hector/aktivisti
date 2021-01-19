import { Model } from 'miragejs'
import { CampaignDto } from '@/api/model/CampaignDto.ts'

export const CampaignModel = Model.extend<Partial<CampaignDto>>({
  id: 1
})
