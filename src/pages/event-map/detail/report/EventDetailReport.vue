<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { EventMetricReportDto } from 'src/api/model/EventMetricReportDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { ionEllipse } from '@quasar/extras/ionicons-v5'
import { QIcon, QPage, QScrollArea, QTable, QTd } from 'quasar'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'

const { event, eventAreas } = useEventDetailStore()
const { t } = useI18n()

const columns = ref<any[]>([
  {
    name: 'areaName',
    field: 'areaName',
    label: t('events.details.report.eventArea'),
    align: 'left'
  }
])

const rows = ref<any[]>([])

onMounted(async () => {
  const { metrics, records } = await fetchMetricRecords()
  //Only create report columns for metrics available for the event
  const eventMetricIds = records.map(({ metric }) => metric)
  for (const { id: metricId, name } of metrics.filter(({ id }) =>
    eventMetricIds.includes(id)
  )) {
    columns.value.push({
      name: metricId,
      field: metricId,
      label: name
    })
  }
  columns.value.push(
    {
      name: 'completedAddresses',
      field: 'completedAddresses',
      label: t('events.details.report.visitedAddresses')
    },
    {
      name: 'overallAddresses',
      field: 'overallAddresses',
      label: t('events.details.report.addressesInEventArea')
    },
    {
      name: 'createdLeads',
      field: 'createdLeads',
      label: t('events.details.report.collectedLeads')
    }
  )

  const summarizedCountsRow: any = {
    areaName: t('events.details.report.total'),
    overallAddresses: 0,
    completedAddresses: 0,
    createdLeads: 0
  }
  for (const { id, color, name } of eventAreas.value) {
    if (id) {
      const {
        completed_addresses,
        overall_addresses,
        counts_per_metric,
        created_leads
      } = await fetchAreaMetricsReports(id)
      const row: any = {
        areaName: name,
        areaColor: color,
        overallAddresses: overall_addresses,
        completedAddresses: completed_addresses,
        createdLeads: created_leads
      }
      summarizedCountsRow.overallAddresses += overall_addresses
      summarizedCountsRow.completedAddresses += completed_addresses
      summarizedCountsRow.createdLeads += created_leads
      for (const { id: metricId } of metrics) {
        const countOfMetric =
          counts_per_metric.find(({ metric }) => metric === metricId)?.count ||
          0
        row[metricId] = countOfMetric
        summarizedCountsRow[metricId] =
          (summarizedCountsRow[metricId] | 0) + countOfMetric
      }
      rows.value.push(row)
    }
  }
  rows.value.push(summarizedCountsRow)
})

async function fetchAreaMetricsReports(
  areaId: number
): Promise<EventMetricReportDto> {
  const response = await apiClient.eventAreas.report(areaId)
  return response.payload.data
}
async function fetchMetricRecords(): Promise<{
  records: EventMetricRecordDto[]
  metrics: EventMetricDto[]
}> {
  const response = await apiClient.eventMetricRecords.list(
    { event: event.value.id },
    ['metric']
  )
  return {
    records: response.payload.data,
    metrics: response.payload.embedded.metric
  }
}
</script>
<template>
  <QScrollArea class="flex flex-fill">
    <QPage>
      <div class="container">
        <QTable
          :columns="columns"
          :flat="!$q.screen.lt.md"
          :grid="$q.screen.lt.md"
          :rows="rows"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
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
                {{ props.value }}
              </div>
            </QTd>
          </template>
        </QTable>
      </div>
    </QPage>
  </QScrollArea>
</template>

<style lang="scss" scoped>
@import 'src/css/_utils.scss';

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
</style>
