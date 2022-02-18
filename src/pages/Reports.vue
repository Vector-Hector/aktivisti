<script setup lang="ts">
import { QBtn, QPage, QScrollArea, useQuasar } from 'quasar'
import { ref } from 'vue'
import SelectReportDialog from 'components/modals/SelectReportDialog/SelectReportDialog.vue'
import ChartFabric from 'components/reportCharts/ChartFabric.vue'
import { uuidv4 } from 'src/utils/uuid'
import { userStore } from 'src/store/UserStore'
import { ReportChartData } from 'src/api/model/ReportChartData'

const reportCharts = ref<ReportChartData[]>([])
reportCharts.value = userStore.state.reportCharts

const $q = useQuasar()

function openReportSelection() {
  $q.dialog({
    component: SelectReportDialog,
    componentProps: {}
  }).onOk(({campaignId, stateAssociationId, subAssociationId, reportType}) => {
      reportCharts.value.push({
        uuid: uuidv4(),
        campaign: campaignId,
        stateAssociation: stateAssociationId ? stateAssociationId : undefined,
        subAssociation: subAssociationId ? subAssociationId : undefined,
        reportType: reportType
      })
      userStore.setReportCharts(reportCharts.value)
    }
  )
}

function handleCloseChart(chart_uuid: string) {
  reportCharts.value = reportCharts.value.filter(({uuid}) => uuid !== chart_uuid)
  userStore.setReportCharts(reportCharts.value)
}

</script>

<template>
  <QScrollArea
    class="d-flex flex-fill"
  >
    <QPage class="flex-fill">
      <div class="container report">
        <ChartFabric
          v-for="chart in reportCharts"
          :key="chart.uuid"
          :uuid="chart.uuid"
          :campaign="chart.campaign"
          :stateAssociation="chart.stateAssociation"
          :subAssociation="chart.subAssociation"
          :reportType="chart.reportType"
          @onClose="handleCloseChart"
        />
        <QBtn
          color="primary"
          class="full-width"
          @click="openReportSelection"
        >
          Hinzufügen
        </QBtn>
      </div>
    </QPage>
  </QScrollArea>
</template>

<style lang="scss" scoped>
@import "src/css/variables.scss";

.reports {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
