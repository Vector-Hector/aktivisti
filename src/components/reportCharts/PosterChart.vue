<script setup lang="ts">
import { apiClient } from 'src/api/ApiClient'
import Charts from 'src/components/reportCharts/Charts.vue'
import { computed, onBeforeMount, ref } from 'vue'
import { PosterStatus, usePosterOptions } from 'src/api/model/PosterDto'
import { ReportPosterDto } from 'src/api/model/ReportPosterDto'
import { ApexDataUtil, ApexDatePoint } from 'src/api/model/ApexDatePoint'
import { useReportScope } from 'components/reportCharts/reportChartScope'
import { ReportType, useReportType } from 'src/api/model/ReportType'
import { useI18n } from 'vue-i18n'

interface Props {
  campaignId: number
  stateAssociationId?: number
  subAssociationId?: number
}

const props = defineProps<Props>()

const { campaign, stateAssociation, subAssociation, fetchData } =
  useReportScope(
    props.campaignId,
    props.stateAssociationId,
    props.subAssociationId
  )

const { t } = useI18n()
const { ReportTypeUtil } = useReportType()
const { PosterStatusUtil } = usePosterOptions()

const absentPosterData = ref<ApexDatePoint[]>([])
const mountedPosterData = ref<ApexDatePoint[]>([])
const damagedPosterData = ref<ApexDatePoint[]>([])
const isLoading = ref<boolean>(false)

onBeforeMount(async () => {
  isLoading.value = true
  await fetchData()
  await fetchPosterReport()
  isLoading.value = false
})

async function fetchPosterReport() {
  const report = (
    await apiClient.reportPoster.list({
      campaign: campaign.value!.id,
      state_association: stateAssociation.value
        ? stateAssociation.value.id
        : undefined,
      sub_association: subAssociation.value
        ? subAssociation.value.id
        : undefined
    })
  ).payload.data
  if (report.length > 0) {
    const firstDateOfChart = new Date(report[0].day)
    const lastDateOfChart = new Date(report[report.length - 1].day)
    absentPosterData.value = ApexDataUtil.fillMissingDataPoints(
      parseApexChartData(report, PosterStatus.ABSENT),
      firstDateOfChart,
      lastDateOfChart
    )
    mountedPosterData.value = ApexDataUtil.fillMissingDataPoints(
      parseApexChartData(report, PosterStatus.MOUNTED),
      firstDateOfChart,
      lastDateOfChart
    )
    damagedPosterData.value = ApexDataUtil.fillMissingDataPoints(
      parseApexChartData(report, PosterStatus.DAMAGED),
      firstDateOfChart,
      lastDateOfChart
    )
  }
}

const series = computed(() => {
  return [
    {
      name: PosterStatusUtil.getLabel(PosterStatus.ABSENT),
      data: absentPosterData.value
    },
    {
      name: PosterStatusUtil.getLabel(PosterStatus.MOUNTED),
      data: mountedPosterData.value
    },
    {
      name: PosterStatusUtil.getLabel(PosterStatus.DAMAGED),
      data: damagedPosterData.value
    }
  ]
})

const chartOptions = computed(() => {
  return {
    colors: ['#93959d', '#2fd370', '#df0505'],
    title: {
      text: ReportTypeUtil.getLabel(ReportType.METRICS_POSTER)
    },
    subtitle: {
      text: `${campaign.value?.name}${
        stateAssociation.value?.name ? ' > ' + stateAssociation.value.name : ''
      }${subAssociation.value?.name ? ' > ' + subAssociation.value.name : ''}`
    },
    noData: {
      text: isLoading.value ? t('apex.loading') : Apex.noData?.text
    }
  }
})

function parseApexChartData(
  report: ReportPosterDto[],
  status: PosterStatus
): ApexDatePoint[] {
  return report.filter((entry) => entry.status === status).map(toApexDatePoint)
}

const toApexDatePoint = (reportPoster: ReportPosterDto) => ({
  x: reportPoster.day,
  y: reportPoster.count
})
</script>

<template>
  <Charts type="area" :options="chartOptions" :series="series" />
</template>
