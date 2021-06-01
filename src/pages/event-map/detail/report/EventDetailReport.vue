<template>
  <DataTable
    class="metrics-table"
    :value="formattedDataPerArea"
  >
    <!-- eslint-disable -->
    <Column
      field="name"
      header="Name"
      footer="Gesamt:"
      footerStyle="text-align:right"
    >
      <!-- eslint-enable -->
      <template #body="{data}">
        <QIcon
          class="icon"
          :style="{
            color: data.color
          }"
          :name="ionEllipse"
        />
        <span> {{ data.name }}</span>
      </template>
    </Column>
    <Column
      v-for="item of metricsWithName"
      :key="item.id"
      :field="item.id.toString()"
      :header="item.name"
      :footer="sumColumn(item.id.toString())"
      style="text-align:right"
    />
    <Column
      field="completed_addresses"
      header="Besuchte Adressen"
      style="text-align:right"
      :footer="sumColumn('completed_addresses')"
    />
    <Column
      field="overall_addresses"
      header="Adressen im Gebiet"
      style="text-align:right"
      :footer="sumColumn('overall_addresses')"
    />
  </DataTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { EventMetricReportDto } from 'src/api/model/EventMetricReportDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { ionEllipse } from '@quasar/extras/ionicons-v5'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { QIcon } from 'quasar'

interface FormattedAreaData {
  id: number,
  color: string,
  completed_addresses: number,
  name: string,
  overall_addresses: number,

  // These keys will be used for dynamic metric ids
  [key: string]: any,
}

interface MetricWithName {
  id: number,
  name: string
}

export default defineComponent({
  name: 'EventDetailReport',
  components: {
    Column,
    DataTable,
    QIcon
  },
  mixins: [EventDetailStoreMixin],
  data() {
    return {
      formattedDataPerArea: [] as FormattedAreaData[],
      metricsWithName: [] as MetricWithName[],
      ionEllipse
    }
  },
  async created() {
    const {metrics} = await this.fetchMetricRecords()
    this.metricsWithName = metrics
    for (const {id, color, name} of this.eventAreas) {
      if (id) {
        const {completed_addresses, overall_addresses, counts_per_metric} = await this.fetchAreaMetricsReports(id)
        const areaData: FormattedAreaData = {
          id,
          color,
          completed_addresses,
          name,
          overall_addresses
        }
        for (const {id: metricId} of this.metricsWithName) {
          areaData[metricId] = counts_per_metric.find(({metric}) => metric === metricId)?.count || 0
        }
        this.formattedDataPerArea.push(areaData)
      }
    }
  },
  methods: {
    async fetchAreaMetricsReports(areaId: number): Promise<EventMetricReportDto> {
      const response = await this.$apiClient.eventAreas.report(areaId)
      return response.payload.data
    },
    async fetchMetricRecords(): Promise<{ records: EventMetricRecordDto[], metrics: EventMetricDto[] }> {
      const response = await this.$apiClient.eventMetricRecords.list({event: this.event.id}, ['metric'])
      return {records: response.payload.data, metrics: response.payload.embedded.metric}
    },
    sumColumn(columnName: string): number {
      return this.formattedDataPerArea.map((row) => row[columnName]).reduce((a: number, b: number) => a + b, 0)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";
@import "src/css/_utils.scss";

.campaign {
  font-weight: bold;
  display: block;
}

.event-name {
  margin: 0 0 1rem 0;
}

.full-width {
  width: 100%;
}

.metrics-table {
  margin-bottom: $inlineSpacing;
}

.icon {
  vertical-align: middle;
  margin-right: $inlineSpacing;
}

</style>
