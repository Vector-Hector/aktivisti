<script setup lang="ts">
import { useReportScope } from 'components/reportCharts/reportChartScope'
import { computed, onBeforeMount, ref } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import VueApexCharts from 'vue3-apexcharts'
import { eventTypeOptions } from 'src/api/model/EventTypes'
import { ReportEventDto } from 'src/api/model/ReportEventDto'
import { ApexDataUtil, ApexDatePoint } from 'src/api/model/ApexDatePoint'
import { ReportType, useReportType } from 'src/api/model/ReportType'
import { useI18n } from 'vue-i18n'

interface Props {
  campaignId: number
  stateAssociationId?: number
  subAssociationId?: number
}

const props = defineProps<Props>()

const { t } = useI18n()
const { ReportTypeUtil } = useReportType()

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
  await fetchReportEvents()
  isLoading.value = false
})

async function fetchReportEvents() {
  const report = (
    await apiClient.reportEvents.list({
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
    series.value = []
    const firstDateOfChart = new Date(report[0].day)
    const lastDateOfChart = new Date(report[report.length - 1].day)
    for (const eventType of eventTypeOptions) {
      const eventTypeData = report
        .filter((entry) => entry.type === eventType.key)
        .map(toApexDatePoint)
      series.value.push({
        name: eventType.label,
        data: ApexDataUtil.fillMissingDataPoints(
          eventTypeData,
          firstDateOfChart,
          lastDateOfChart
        )
      })
    }
  }
}

const toApexDatePoint = (reportEvent: ReportEventDto) => ({
  x: reportEvent.day,
  y: reportEvent.count
})

const chartOptions = computed(() => {
  return {
    chart: {
      stacked: true
    },
    title: {
      text: `${ReportTypeUtil.getLabel(ReportType.ACTIVE_EVENTS)}`
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
</script>
<template>
  <VueApexCharts type="area" :options="chartOptions" :series="series" />
</template>
