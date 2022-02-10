<script setup lang="ts">

import { apiClient } from 'src/api/ApiClient'
import VueApexCharts from 'vue3-apexcharts'
import { computed, onBeforeMount, ref } from 'vue'
import { PosterStatus, PosterStatusUtil } from 'src/api/model/PosterDto'
import { ReportPosterDto } from 'src/api/model/ReportPosterDto'
import { ApexDataUtil, ApexDatePoint } from 'src/api/model/ApexDatePoint'
import { useReportScope } from 'components/reportCharts/reportChartScope'
import { defaultApexChartOptions } from 'boot/apex'

interface Props {
  campaignId: number,
  stateAssociationId?: number,
  subAssociationId?: number,
}

const props = defineProps<Props>()

const {
  campaign,
  stateAssociation,
  subAssociation,
  fetchData
} = useReportScope(props.campaignId, props.stateAssociationId, props.subAssociationId)

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
  const report = (await apiClient.reportPoster.list({
    campaign: campaign.value!.id,
    state_association: stateAssociation.value ? stateAssociation.value.id : undefined,
    sub_association: subAssociation.value ? subAssociation.value.id : undefined
  })).payload.data
  if (report.length > 0) {
    const firstDateOfChart = new Date(report[0].day)
    const lastDateOfChart = new Date(report[report.length - 1].day)
    absentPosterData.value = ApexDataUtil.fillMissingDataPoints(parseApexChartData(report, PosterStatus.ABSENT), firstDateOfChart, lastDateOfChart)
    mountedPosterData.value = ApexDataUtil.fillMissingDataPoints(parseApexChartData(report, PosterStatus.MOUNTED), firstDateOfChart, lastDateOfChart)
    damagedPosterData.value = ApexDataUtil.fillMissingDataPoints(parseApexChartData(report, PosterStatus.DAMAGED), firstDateOfChart, lastDateOfChart)
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
      text: 'Plakate'
    },
    subtitle: {
      text: `${campaign.value?.name}${stateAssociation.value?.name ? ' > ' + stateAssociation.value.name : ''}${subAssociation.value?.name ? ' > ' + subAssociation.value.name : ''}`
    },
    noData: {
      text: isLoading.value ? 'Lade Daten...' : defaultApexChartOptions.noData?.text
    }
  }
})


function parseApexChartData(report: ReportPosterDto[], status: PosterStatus): ApexDatePoint[] {
  return report
    .filter((entry) => entry.status === status)
    .map(toApexDatePoint)
}

const toApexDatePoint = (reportPoster: ReportPosterDto) => ({x: reportPoster.day, y: reportPoster.count})

</script>

<template>
  <VueApexCharts type="area" :options="chartOptions" :series="series" />
</template>
