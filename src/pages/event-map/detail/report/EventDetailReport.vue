<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { EventMetricReportDto } from 'src/api/model/EventMetricReportDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { ionEllipse, ionArchive } from '@quasar/extras/ionicons-v5'
import {
  exportFile,
  QBtn,
  QIcon,
  QPage,
  QScrollArea,
  QTable,
  QTd,
  useQuasar
} from 'quasar'
import { useEventStore } from 'src/stores/event'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const eventStore = useEventStore()
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
  for (const { id, color, name } of eventStore.eventAreas) {
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
    { event: eventStore.event.id },
    ['metric']
  )
  return {
    records: response.payload.data,
    metrics: response.payload.embedded.metric
  }
}

function wrapCsvValue(value) {
  let formatted = value === null ? '' : String(value)
  // Escape quotes (") in strings
  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
}

function handleExportToCSV() {
  const header = columns.value.map((col) => wrapCsvValue(col.label))
  const body = rows.value.map((row) =>
    columns.value.map((col) => wrapCsvValue(row[col.field])).join(',')
  )
  const content = [header].concat(body).join('\r\n')

  const timestamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const fileName = `Report_${eventStore.event.id}_${eventStore.event.name.replace(/\s+/g, '_')}_${timestamp}.csv`

  const status = exportFile(fileName, content, 'text/csv')

  if (status !== true) {
    $q.notify({
      message: t('events.details.report.csvExport.errorMessage'),
      color: 'negative'
    })
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
          <template v-slot:top-right>
            <QBtn
              color="primary"
              :icon-right="ionArchive"
              no-caps
              :label="$t('events.details.report.csvExport.label')"
              @click="handleExportToCSV"
            />
          </template>
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
