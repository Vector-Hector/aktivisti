<script setup lang="ts">
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { ApexDatePoint } from 'src/api/model/ApexDatePoint'
import { computed, onBeforeMount, ref } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import Charts from 'src/components/reportCharts/Charts.vue'
import { ReportEventMetricsDto } from 'src/api/model/ReportEventMetricsDto'
import { useReportScope } from 'components/reportCharts/reportChartScope'
import { useI18n } from 'vue-i18n'

interface Props {
  title?: string
  eventMetrics?: EventMetricDto[]
  campaignId: number
  stateAssociationId?: number
  subAssociationId?: number
}

const props = defineProps<Props>()

interface ApexSeriesEntity {
  name: string
  data: ApexDatePoint[]
}

const { t } = useI18n()
const { campaign, stateAssociation, subAssociation, fetchData } =
  useReportScope(
    props.campaignId,
    props.stateAssociationId,
    props.subAssociationId
  )

const series = ref<ApexSeriesEntity[]>([])
const isLoading = ref<boolean>(false)

onBeforeMount(async () => {
  isLoading.value = true
  await fetchData()
  await fetchMetricsReport()
  isLoading.value = false
})

async function fetchMetricsReport() {
  if (props.eventMetrics) {
    const report = (
      await apiClient.reportEventMetrics.list({
        campaign: campaign.value!.id,
        state_association: stateAssociation.value
          ? stateAssociation.value.id
          : undefined,
        sub_association: subAssociation.value
          ? subAssociation.value.id
          : undefined,
        metrics: props.eventMetrics.map(({ id }) => id)
      })
    ).payload.data
    series.value = []
    for (const metric of props.eventMetrics) {
      const metricData = report
        .filter((entry) => entry.metric === metric.id)
        .map(toApexDatePoint)
      series.value.push({
        name: metric.name,
        data: metricData
      })
    }
  }
}

const toApexDatePoint = (reportMetric: ReportEventMetricsDto) => ({
  x: reportMetric.day,
  y: reportMetric.count
})

const chartOptions = computed(() => {
  return {
    chart: {
      stacked: false
    },
    title: {
      text: `${props.title ? props.title : ''}`
    },
    subtitle: {
      text: `${campaign.value?.name}${
        stateAssociation.value?.name ? ' > ' + stateAssociation.value.name : ''
      }${subAssociation.value?.name ? ' > ' + subAssociation.value.name : ''}`
    },
    noData: {
      text: isLoading.value ? t('reports.loadData') : Apex.noData?.text
    }
  }
})
</script>
<template>
  <Charts type="line" :options="chartOptions" :series="series" />
</template>
