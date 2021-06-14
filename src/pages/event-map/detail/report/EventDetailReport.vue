<template>
    <QTable
      :columns="columns"
      dense
      :flat=!$q.screen.lt.md
      :grid=$q.screen.lt.md
      :rows="rows"
      hide-pagination
      row-key="name"
    >
      <template v-slot:body-cell-areaName="props">
        <QTd :props="props">
          <div>
            <QIcon
              v-if="props.row.areaColor"
              class="area-indicator-icon"
              :name="ionEllipse"
              :style="{ color: props.row.areaColor }"
            />
            {{props.value}}
          </div>
        </QTd>
      </template>
    </QTable>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventMetricReportDto } from 'src/api/model/EventMetricReportDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { ionEllipse } from '@quasar/extras/ionicons-v5'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { QIcon, QTable, QTd} from 'quasar'

export default defineComponent({
  name: 'EventDetailReport',
  components: {
    QIcon,
    QTable,
    QTd
  },
  mixins: [EventDetailStoreMixin],
  data() {
    return {
      ionEllipse,
      filter: '',
      columns: [
        {
          name: 'areaName',
          field: 'areaName',
          label: 'Gebiet',
          align: 'left',
        }
      ] as any[],
      rows: [ ] as any,
    }
  },
  async created() {
    const {metrics} = await this.fetchMetricRecords()
    for (const {id: metricId, name } of metrics){
      this.columns.push({
        name: metricId,
        field: metricId,
        label: name,
      })
    }
    this.columns.push(
      {
      name: 'completedAddresses',
      field: 'completedAddresses',
      label: 'Besuchte Adressen'
     },{
        name: 'overallAddresses',
        field: 'overallAddresses',
        label: 'Adressen im Gebiet'
      },{
        name: 'createdLeads',
        field: 'createdLeads',
        label: 'Gewonnene Kontakte'
      }
     )

    const footerRow : any = {
      areaName: 'Gesamt',
      overallAddresses: 0,
      completedAddresses: 0,
      createdLeads: 0
    }
    for (const {id, color, name} of this.eventAreas) {
      if (id) {
        const {completed_addresses, overall_addresses, counts_per_metric, created_leads} = await this.fetchAreaMetricsReports(id)
        const row : any = {
          areaName: name,
          areaColor: color,
          overallAddresses: overall_addresses,
          completedAddresses:  completed_addresses,
          createdLeads: created_leads
        }
        footerRow.overallAddresses += overall_addresses;
        footerRow.completedAddresses += completed_addresses;
        footerRow.createdLeads += created_leads;
        for (const {id: metricId} of metrics) {
          const countOfMetric = counts_per_metric.find(({metric}) => metric === metricId)?.count || 0
          row[metricId] = countOfMetric
          footerRow[metricId] =  (footerRow[metricId] | 0 ) + countOfMetric
        }
        this.rows.push(row)
      }
    }
    this.rows.push(footerRow)
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
