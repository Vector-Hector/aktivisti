<template>
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

export default defineComponent({
  name: 'PersonalMetrics',
  components: {QTable},
  data() {
    return {
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
      personalMetrics: {} as PersonalMetricsDto
    }
  },
  async created() {
    const [personalMetricsResponse, metricsResponse] = await Promise.all([
      this.$apiClient.personalMetrics.list(),
      this.$apiClient.eventMetrics.list()
    ])
    this.personalMetrics = personalMetricsResponse.payload.data
    this.eventMetrics = metricsResponse.payload.data
  },
  computed: {
    personalMetricsRows(): {name?: string, value: number}[] {
      let generalMetrics = [] as {name?: string, value: number}[]
      if (this.personalMetrics?.counts_per_metric !== undefined) {
        generalMetrics = this.personalMetrics.counts_per_metric.map(({
                                                                       count,
                                                                       metric
                                                                     }: {count: number, metric: number}) => {
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
  }
})
</script>
