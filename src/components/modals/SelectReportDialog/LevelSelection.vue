<script setup lang="ts">
import { PermissionCodename } from 'src/api/model/UserObjectPermissionDto'
import { CampaignDto, CampaignLevel } from 'src/api/model/CampaignDto'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import { StateAssociationDto } from 'src/api/model/StateAssociationDto'
import { ContentTypeNaturalKey } from 'src/api/model/ContentTypeDto'
import { computed, onBeforeMount, ref, watch } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import StateAssociationFilter from 'components/filterInput/filters/StateAssociationFilter.vue'
import SubAssociationFilter from 'components/filterInput/filters/SubAssociationFilter.vue'
import { useUserStore } from 'src/stores/user'

interface Emits {
  (
    e: 'onSelect',
    campaignId: number,
    stateAssociationId: number,
    subAssociationId: number
  ): void
}

const emit = defineEmits<Emits>()

const userStore = useUserStore()

const campaigns = ref<CampaignDto[]>([])
const allManagedCampaigns = ref<CampaignDto[]>([])
const selectedCampaignId = ref<number | null>(null)
const selectedCampaign = computed(() =>
  campaigns.value.find(({ id }) => id === selectedCampaignId.value)
)

const stateAssociations = ref<StateAssociationDto[]>([])
const allManagedStateAssociations = ref<StateAssociationDto[]>([])
const selectedStateAssociationId = ref<number | null>(null)
const isAbleToRequestAllStateAssociations = ref<boolean>(false)

const selectedSubAssociationId = ref<number | null>(null)
const subAssociations = ref<SubAssociationDto[]>([])
const isAbleToRequestAllSubAssociations = ref<boolean>(false)

const explicitManagedCampaignsIds = explicitMangedObjects(
  ContentTypeNaturalKey.CAMPAIGN
)
const explicitManagedStateAssociationsId = explicitMangedObjects(
  ContentTypeNaturalKey.STATE_ASSOCIATION
)
const explicitManagedSubAssociationsId = explicitMangedObjects(
  ContentTypeNaturalKey.SUB_ASSOCIATION
)

onBeforeMount(async () => {
  const allCampaigns = await fetchAllCampaigns()
  if (userStore.isAdminOrGlobalCoordinator) {
    campaigns.value = allCampaigns
    allManagedCampaigns.value = allCampaigns
  } else {
    for (const camp of allCampaigns) {
      const isManagedCampaign = explicitManagedCampaignsIds.includes(camp.id)
      if (isManagedCampaign) {
        campaigns.value.push(camp)
        allManagedCampaigns.value.push(camp)
      } else {
        if (camp.campaign_level === CampaignLevel.FEDERAL) {
          if (
            explicitManagedStateAssociationsId.length > 0 ||
            explicitManagedSubAssociationsId.length > 0
          ) {
            campaigns.value.push(camp)
          }
        }
        if (camp.campaign_level === CampaignLevel.STATE_ASSOCIATION) {
          const isCampaignAssociationManaged =
            explicitManagedStateAssociationsId.includes(camp.state_association!)
          if (isCampaignAssociationManaged) {
            campaigns.value.push(camp)
          } else {
            const managedSubAssociations = await fetchSubAssociations(
              explicitManagedSubAssociationsId
            )
            const requiredStateAssociations = managedSubAssociations.map(
              ({ state_association }) => state_association
            )
            const isRequiredStateAssociationCampaignAssociation =
              requiredStateAssociations.includes(camp.state_association)
            if (isRequiredStateAssociationCampaignAssociation) {
              campaigns.value.push(camp)
            }
          }
        }
        if (camp.campaign_level === CampaignLevel.SUB_ASSOCIATION) {
          const campaignSubAssociation = await fetchSubAssociation(
            camp.sub_association!
          )
          if (
            explicitManagedSubAssociationsId.includes(
              campaignSubAssociation.id
            ) ||
            explicitManagedStateAssociationsId.includes(
              campaignSubAssociation.state_association
            )
          ) {
            campaigns.value.push(camp)
          }
        }
      }
    }
  }
  selectedCampaignId.value = campaigns.value[0].id
})

watch(
  () => selectedCampaign.value,
  async (campaign) => {
    if (campaign!.campaign_level === CampaignLevel.FEDERAL) {
      const isManagedCampaign = allManagedCampaigns.value
        .map(({ id }) => id)
        .includes(campaign!.id)
      if (isManagedCampaign) {
        stateAssociations.value = await fetchAllStateAssociations()

        allManagedStateAssociations.value = stateAssociations.value
        isAbleToRequestAllStateAssociations.value = true
        selectedStateAssociationId.value = 0
      } else {
        stateAssociations.value = await fetchStateAssociations(
          explicitManagedStateAssociationsId
        )

        allManagedStateAssociations.value = stateAssociations.value
        isAbleToRequestAllStateAssociations.value = false
        if (explicitManagedSubAssociationsId.length > 0) {
          const managedSubAssociations = await fetchSubAssociations(
            explicitManagedSubAssociationsId
          )
          let parentStateAssociationsId = managedSubAssociations.map(
            ({ state_association }) => state_association
          )
          parentStateAssociationsId = [...new Set(parentStateAssociationsId)]
          const parentStateAssociation = await fetchStateAssociations(
            parentStateAssociationsId
          )
          stateAssociations.value = [
            ...new Set([...stateAssociations.value, ...parentStateAssociation])
          ]
        }
        selectedStateAssociationId.value = stateAssociations.value[0].id
      }
    } else if (campaign!.campaign_level === CampaignLevel.STATE_ASSOCIATION) {
      stateAssociations.value = [
        await fetchStateAssociation(campaign!.state_association!)
      ]
      isAbleToRequestAllStateAssociations.value = false
      selectedStateAssociationId.value = stateAssociations.value[0].id
    } else if (campaign!.campaign_level === CampaignLevel.SUB_ASSOCIATION) {
      const subAssociation = await fetchSubAssociation(
        campaign!.sub_association!
      )
      stateAssociations.value = [
        await fetchStateAssociation(subAssociation.state_association)
      ]
      isAbleToRequestAllStateAssociations.value = false
      selectedStateAssociationId.value = stateAssociations.value[0].id
    }
  }
)

watch(
  [() => selectedStateAssociationId.value, () => selectedCampaignId.value],
  async ([stateAssociationId]) => {
    subAssociations.value = []
    const isAllStateAssociations = stateAssociationId === 0
    const isManagedStateAssociation = allManagedStateAssociations.value
      .map(({ id }) => id)
      .includes(stateAssociationId!)
    if (isAllStateAssociations) {
      isAbleToRequestAllSubAssociations.value = true
      selectedSubAssociationId.value = 0
    } else {
      if (
        selectedCampaign.value?.campaign_level === CampaignLevel.SUB_ASSOCIATION
      ) {
        subAssociations.value = [
          await fetchSubAssociation(selectedCampaign.value.sub_association!)
        ]
        selectedSubAssociationId.value = subAssociations.value[0].id
        isAbleToRequestAllSubAssociations.value = false
      } else {
        if (stateAssociationId) {
          const allSubAssociationOfState =
            await fetchAllSubAssociations(stateAssociationId)
          if (isManagedStateAssociation) {
            subAssociations.value = allSubAssociationOfState
            isAbleToRequestAllSubAssociations.value = true
            selectedSubAssociationId.value = 0
          } else {
            for (const sub of allSubAssociationOfState) {
              const isManagedSubAssociation =
                explicitManagedSubAssociationsId.includes(sub.id)
              if (isManagedSubAssociation) {
                subAssociations.value.push(sub)
              }
            }
            isAbleToRequestAllSubAssociations.value = false
            selectedSubAssociationId.value = subAssociations.value[0].id
          }
        }
      }
    }
  }
)

watch(
  [selectedCampaignId, selectedStateAssociationId, selectedSubAssociationId],
  ([
    selectedCampaignId,
    selectedStateAssociationId,
    selectedSubAssociationId
  ]) => {
    emit(
      'onSelect',
      selectedCampaignId ? selectedCampaignId : 0,
      selectedStateAssociationId ? selectedStateAssociationId : 0,
      selectedSubAssociationId ? selectedSubAssociationId : 0
    )
  }
)

function explicitMangedObjects(contentType: ContentTypeNaturalKey): number[] {
  return userStore.myPermissions
    .filter(
      ({ permission_codename, content_type_natural_key }) =>
        permission_codename === PermissionCodename.MANAGE_EVENTS &&
        content_type_natural_key === contentType
    )
    .map(({ object_pk }) => parseInt(object_pk))
}

async function fetchAllCampaigns() {
  return (await apiClient.campaigns.list({ include_expired: true })).payload
    .data
}

function handleCampaignSelection(campaignId: number) {
  selectedCampaignId.value = campaignId
}

async function fetchAllStateAssociations() {
  return (await apiClient.stateAssociations.list()).payload.data
}

async function fetchStateAssociations(ids: number[]) {
  return await multipleFetch(fetchStateAssociation, ids)
}

async function fetchStateAssociation(id: number) {
  return (await apiClient.stateAssociations.get(id.toString())).payload.data
}

function handleStateAssociationSelection(stateAssociationId: number) {
  selectedStateAssociationId.value = stateAssociationId ? stateAssociationId : 0
}

async function fetchSubAssociation(id: number) {
  return (await apiClient.subAssociations.get(id.toString())).payload.data
}

async function fetchAllSubAssociations(stateAssociationId: number) {
  return (
    await apiClient.subAssociations.list({
      state_association: stateAssociationId
    })
  ).payload.data
}

async function fetchSubAssociations(ids: number[]) {
  return await multipleFetch(fetchSubAssociation, ids)
}

async function multipleFetch<T>(
  fetch: (id: number) => Promise<T>,
  ids: number[]
) {
  const fetchPromises: Promise<any>[] = []
  for (const id of ids) {
    fetchPromises.push(fetch(id))
  }
  return await Promise.all(fetchPromises)
}

function handleSubAssociationSelection(subAssociationId: number) {
  selectedSubAssociationId.value = subAssociationId ? subAssociationId : 0
}
</script>
<template>
  <CampaignFilter
    :label="$t('reports.selectReportDialog.campaign')"
    :options="campaigns"
    :show-all-campaigns="false"
    :model-value="selectedCampaignId"
    :disable="campaigns.length < 2"
    @update:model-value="handleCampaignSelection"
  />
  <StateAssociationFilter
    :label="$t('reports.selectReportDialog.stateAssociation')"
    :options="stateAssociations"
    :model-value="selectedStateAssociationId"
    :disable="stateAssociations.length < 2"
    :show-all-state-association="isAbleToRequestAllStateAssociations"
    @update:model-value="handleStateAssociationSelection"
  />
  <SubAssociationFilter
    :options="subAssociations"
    :model-value="selectedSubAssociationId"
    :disable="subAssociations.length < 2"
    :show-all-sub-association="isAbleToRequestAllSubAssociations"
    @update:model-value="handleSubAssociationSelection"
  />
</template>
