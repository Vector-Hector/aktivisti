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
<script lang="ts">

import { defineComponent } from 'vue'
import { PersonalMetricsDto } from 'src/api/model/PersonalMetricsDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { QTable } from 'quasar'
import CampaignFilter from 'components/filterInput/filters/CampaignFilter.vue'
import { CampaignDto } from 'src/api/model/CampaignDto'

export default defineComponent({
  name: 'PersonalMetrics',
  components: {CampaignFilter, QTable},
  data() {
    return {
      campaigns: [] as CampaignDto[],
      eventMetrics: {} as EventMetricDto[],
      personalMetricsColumns: [
        {
          field: 'name',
          name: 'name',
          label: 'Ergebnis',
          align: 'left'
        }, {
          field: 'value',
          name: 'value',
          label: 'Anzahl'
        }
      ],
      personalMetrics: {} as PersonalMetricsDto,
      selectedCampaign: undefined as number | undefined
    }
  },
  async created() {
    const [campaignsResponse, personalMetricsResponse, metricsResponse] = await Promise.all([
      this.$apiClient.campaigns.list({include_expired: true, has_participated: true}),
      this.$apiClient.personalMetrics.list(),
      this.$apiClient.eventMetrics.list()
    ])
    this.personalMetrics = personalMetricsResponse.payload.data
    this.eventMetrics = metricsResponse.payload.data
    this.campaigns = campaignsResponse.payload.data
  },
  computed: {
    personalMetricsRows(): {name?: string, value: number}[] {
      let generalMetrics = [] as {name?: string, value: number}[]
      if (this.personalMetrics?.counts_per_metric !== undefined) {
        generalMetrics = this.personalMetrics
          .counts_per_metric
          .map(
            ({count, metric}: {count: number, metric: number}) => {
              return {
                name: this.eventMetrics.find(({id}) => id === metric)?.name,
                value: count
              }
            })
      }
      return [
        ...generalMetrics,
        {
          name: 'Besuchte Adressen',
          value: this.personalMetrics.completed_addresses ?? 0
        }
      ]
    }
  },
  methods: {
    async handleUpdateCampaign(campaign: number) {
      const filterParams = {campaign: campaign ? campaign : undefined}
      this.personalMetrics = (await this.$apiClient.personalMetrics.list(filterParams)).payload.data
      this.selectedCampaign = campaign
    }
  }
})
</script>
