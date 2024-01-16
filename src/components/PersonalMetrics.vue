<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PersonalMetricsDto } from 'src/api/model/PersonalMetricsDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { QTable } from 'quasar'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import { CampaignDto } from 'src/api/model/CampaignDto'
import { apiClient } from 'src/api/ApiClient'

const campaigns = ref<CampaignDto[]>([])
const eventMetrics = ref<EventMetricDto[]>([])
const personalMetricsColumns = [
  {
    field: 'name',
    name: 'name',
    label: 'Ergebnis',
    align: 'left'
  },
  {
    field: 'value',
    name: 'value',
    label: 'Anzahl'
  }
]
const personalMetrics = ref<Partial<PersonalMetricsDto>>({})
const selectedCampaign = ref<number | undefined>(undefined)

onMounted(async () => {
  const [campaignsResponse, personalMetricsResponse, metricsResponse] =
    await Promise.all([
      apiClient.campaigns.list({
        include_expired: true,
        has_participated: true
      }),
      apiClient.personalMetrics.list(),
      apiClient.eventMetrics.list()
    ])
  personalMetrics.value = personalMetricsResponse.payload.data
  eventMetrics.value = metricsResponse.payload.data
  campaigns.value = campaignsResponse.payload.data
})

const personalMetricsRows = computed(() => {
  let generalMetrics = [] as { name?: string; value: number }[]
  if (personalMetrics.value?.counts_per_metric !== undefined) {
    generalMetrics = personalMetrics.value.counts_per_metric.map(
      ({ count, metric }: { count: number; metric: number }) => {
        return {
          name: eventMetrics.value.find(({ id }) => id === metric)?.name,
          value: count
        }
      }
    )
  }
  return [
    ...generalMetrics,
    {
      name: 'Besuchte Adressen',
      value: personalMetrics.value.completed_addresses ?? 0
    }
  ]
})

async function handleUpdateCampaign(campaign: number) {
  const filterParams = { campaign: campaign ? campaign : undefined }
  personalMetrics.value = (
    await apiClient.personalMetrics.list(filterParams)
  ).payload.data
  selectedCampaign.value = campaign
}
</script>
<template>
  <CampaignFilter
    :model-value="selectedCampaign"
    :options="campaigns"
    @update:model-value="handleUpdateCampaign"
  />
  <QTable
    flat
    hide-pagination
    :rows="personalMetricsRows"
    :columns="personalMetricsColumns"
    row-key="name"
  />
</template>
