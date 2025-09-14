import { CampaignDto, CampaignLevel } from 'src/api/model/CampaignDto'

export function showCampaignLevel(campaign: CampaignDto) {
  switch (campaign.campaign_level) {
    case CampaignLevel.FEDERAL:
      return 'Bund'
    case CampaignLevel.STATE_ASSOCIATION:
      return 'Land'
    case CampaignLevel.SUB_ASSOCIATION:
      return 'Bezirk'
    default:
      break
  }
}
