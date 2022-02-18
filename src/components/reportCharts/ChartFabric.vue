<script setup lang="ts">

import { ReportType } from 'src/api/model/ReportType'
import ActiveEventsChart from 'components/reportCharts/ActiveEventsChart.vue'
import ActiveUsersChart from 'components/reportCharts/ActiveUsersChart.vue'
import PosterChart from 'components/reportCharts/PosterChart.vue'
import FlyerMetricChart from 'components/reportCharts/eventMetrics/FlyerMetricChart.vue'
import Door2DoorMetricChart from 'components/reportCharts/eventMetrics/Door2DoorMetricChart.vue'
import { ionClose } from '@quasar/extras/ionicons-v5'
import { QBtn } from 'quasar'

interface Props {
  uuid: string,
  campaign: number,
  stateAssociation?: number,
  subAssociation?: number,
  reportType: ReportType
}

interface Emits {
  (e: 'onClose', uuid: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()


const chartType = {
  METRICS_POSTER: PosterChart,
  METRICS_FLYER: FlyerMetricChart,
  METRICS_DOOR2DOOR: Door2DoorMetricChart,
  ACTIVE_EVENTS: ActiveEventsChart ,
  ACTIVE_USERS: ActiveUsersChart
}

function handleClose() {
  emit('onClose', props.uuid)
}


</script>
<template>
  <div>
    <QBtn
      @click="handleClose"
      :icon="ionClose"
      flat
      round
      :ripple-effect="false"
    />
    <component :is="chartType[props.reportType]" :campaignId="props.campaign"
               :stateAssociationId="props.stateAssociation"
               :subAssociationId="props.subAssociation" />
  </div>
</template>
<style lang="scss">
</style>
