<script setup lang="ts">

import { ReportType } from 'src/api/model/ReportType'
import ActiveEventsChart from 'components/reportCharts/ActiveEventsChart.vue'
import ActiveUsersChart from 'components/reportCharts/ActiveUsersChart.vue'
import PosterChart from 'components/reportCharts/PosterChart.vue'
import FlyerMetricChart from 'components/reportCharts/eventMetrics/FlyerMetricChart.vue'
import Door2DoorMetricChart from 'components/reportCharts/eventMetrics/Door2DoorMetricChart.vue'
import { ionTrashOutline } from '@quasar/extras/ionicons-v5'
import { QBtn, QCard, QCardSection, QCardActions } from 'quasar'

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
  ACTIVE_EVENTS: ActiveEventsChart,
  ACTIVE_USERS: ActiveUsersChart
}

function handleClose() {
  emit('onClose', props.uuid)
}


</script>
<template>
  <QCard bordered class="card">
    <QCardSection horizontal>
      <component class="col q-pa-md" :is="chartType[props.reportType]" :campaignId="props.campaign"
                 :stateAssociationId="props.stateAssociation"
                 :subAssociationId="props.subAssociation" />
      <QCardActions vertical class="justify-around">
        <QBtn
          size="sm"
          @click="handleClose"
          :icon="ionTrashOutline"
          flat
          round
          :ripple-effect="false"
        />
      </QCardActions>
    </QCardSection>
  </QCard>
</template>
<style lang="scss">
.card {
  background-color: #F4F5F8;
}
</style>
