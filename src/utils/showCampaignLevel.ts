import { CampaignDto } from 'src/api/model/CampaignDto';

export function showCampaignLevel(campaign: CampaignDto) {
  switch (campaign.campaign_level) {
  case 'FEDERAL':
    return 'Bund'
  case 'STATE_ASSOCIATION':
    return 'Land'
  case 'SUB_ASSOCIATION':
    return 'Bezirk'
  default:
    break;
  }
}
