<script setup lang="ts">
import { ApexDataUtil, ApexDatePoint } from 'src/api/model/ApexDatePoint'
import { useReportScope } from 'components/reportCharts/reportChartScope'
import { computed, onBeforeMount, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { apiClient } from 'src/api/ApiClient'
import { ReportType, ReportTypeUtil } from 'src/api/model/ReportType'
import { ReportActiveUsersDto } from 'src/api/model/ReportActiveUsersDto'
import { EventTypes, EventTypesUtil } from 'src/api/model/EventTypes'

interface Props {
  campaignId: number
  stateAssociationId?: number
  subAssociationId?: number
}

const props = defineProps<Props>()

interface ApexSeriesEntity {
  name: string
  data: ApexDatePoint[]
}

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
  await fetchActiveUsersReport()
  isLoading.value = false
})

async function fetchActiveUsersReport() {
  const scopeQueryParams = {
    campaign: campaign.value!.id,
    state_association: stateAssociation.value
      ? stateAssociation.value.id
      : undefined,
    sub_association: subAssociation.value ? subAssociation.value.id : undefined
  }
  const reportOverall = (
    await apiClient.reportActiveUsers.list(scopeQueryParams)
  ).payload.data
  if (reportOverall.length > 0) {
    const firstDateOfChart = new Date(reportOverall[0].day)
    const lastDateOfChart = new Date(
      reportOverall[reportOverall.length - 1].day
    )
    const reportDoor2Door = (
      await apiClient.reportActiveUsers.list({
        ...scopeQueryParams,
        event_type: EventTypes.DOOR_TO_DOOR
      })
    ).payload.data
    const reportFlyer = (
      await apiClient.reportActiveUsers.list({
        ...scopeQueryParams,
        event_type: EventTypes.FLYERS
      })
    ).payload.data
    series.value = [
      {
        name: 'Gesamt',
        data: ApexDataUtil.fillMissingDataPoints(
          reportOverall.map(toApexDatePoint),
          firstDateOfChart,
          lastDateOfChart
        )
      },
      {
        name: EventTypesUtil.getLabel(EventTypes.DOOR_TO_DOOR),
        data: ApexDataUtil.fillMissingDataPoints(
          reportDoor2Door.map(toApexDatePoint),
          firstDateOfChart,
          lastDateOfChart
        )
      },
      {
        name: EventTypesUtil.getLabel(EventTypes.FLYERS),
        data: ApexDataUtil.fillMissingDataPoints(
          reportFlyer.map(toApexDatePoint),
          firstDateOfChart,
          lastDateOfChart
        )
      }
    ]
  }
}

const toApexDatePoint = (reportEvent: ReportActiveUsersDto) => ({
  x: reportEvent.day,
  y: reportEvent.count
})

const chartOptions = computed(() => {
  return {
    chart: {
      stacked: false
    },
    title: {
      text: `${ReportTypeUtil.getLabel(ReportType.ACTIVE_USERS)}`
    },
    subtitle: {
      text: `${campaign.value?.name}${
        stateAssociation.value?.name ? ' > ' + stateAssociation.value.name : ''
      }${subAssociation.value?.name ? ' > ' + subAssociation.value.name : ''}`
    },
    yaxis: {
      decimalsInFloat: 3
    },
    noData: {
      text: isLoading.value ? 'Lade Daten...' : Apex.noData?.text
    }
  }
})
</script>
<template>
  <VueApexCharts type="line" :options="chartOptions" :series="series" />
</template>
