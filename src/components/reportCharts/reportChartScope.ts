import { ref } from 'vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { apiClient } from 'src/api/ApiClient'

export function useReportScope(
  campaignId: number,
  stateAssociationId: number | undefined,
  subAssociationId: number | undefined
) {
  const campaign = ref<CampaignDto | null>(null)
  const stateAssociation = ref<StateAssociationDto | null>(null)
  const subAssociation = ref<SubAssociationDto | null>(null)

  /**
   * Update campaign, stateAssociation, subAssociation with Dto's from API.
   */
  async function fetchData() {
    campaign.value = await fetchCampaign(campaignId)
    if (stateAssociationId) {
      stateAssociation.value = await fetchStateAssociation(stateAssociationId)
    }
    if (subAssociationId) {
      subAssociation.value = await fetchSubAssociation(subAssociationId)
    }
  }

  async function fetchCampaign(id: number) {
    return (
      await apiClient.campaigns.get(id.toString(), [], {
        include_expired: true
      })
    ).payload.data
  }

  async function fetchStateAssociation(id: number) {
    return (await apiClient.stateAssociations.get(id.toString())).payload.data
  }

  async function fetchSubAssociation(id: number) {
    return (await apiClient.subAssociations.get(id.toString())).payload.data
  }

  return {
    campaign,
    stateAssociation,
    subAssociation,
    fetchData
  }
}
