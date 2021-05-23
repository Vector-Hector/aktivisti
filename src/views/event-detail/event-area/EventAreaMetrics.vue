<template>
  <div class="create-lead">
    <router-link
      :to="{ name: 'create-lead' }"
    >
      <IonButton>
        Kontakt registrieren
      </IonButton>
    </router-link>
  </div>

  <IonGrid
    v-if="metricRecords.length"
  >
    <MetricsRow
      v-for="metricRecord in metricRecords"
      :key="metricRecord.metric"
      :model-value="metricValues[metricRecord.id]"
      :label="getMetricForId(metricRecord.metric).name"
      class="metrics-input"
      @update:modelValue="updateMetricValue(metricRecord.id, $event)"
    />
  </IonGrid>
  <IonText
    v-else
    color="medium"
  >
    Für dieses wurden keine Metriken definiert
  </IonText>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventMetricRecordDto } from '@/api/model/EventMetricRecordDto'
import { EventMetricDto } from '@/api/model/EventMetricDto'
import { MetricValueMap, trackingSessionStore } from '@/store/TrackingSessionStore'
import { IonButton, IonGrid, IonText } from '@ionic/vue'
import MetricsRow from '@/components/MetricsRow.vue'
import EventAreaMetricsMixin from '@/views/event-detail/event-area/EventAreaMetricsMixin'
import { uiStore } from '@/store/UiStore'


export default defineComponent({
  name: 'EventAreaMetrics',
  components: {
    MetricsRow,
    IonGrid,
    IonText,
    IonButton
  },
  mixins: [EventAreaMetricsMixin],
  data() {
    return {
      metricRecords: [] as EventMetricRecordDto[],
      metrics: [] as EventMetricDto[]
    }
  },
  computed: {
    metricValues: {
      get(): MetricValueMap {
        const storedValues = trackingSessionStore.getMetricsForAddress(this.eventArea.id!, this.address!)
        if (storedValues) {
          return storedValues
        } else {
          const defaultObject: MetricValueMap = {}
          for (const metricRecord of this.metricRecords) {
            defaultObject[metricRecord.id] = 0
          }
          return defaultObject
        }
      },
      set(metrics: MetricValueMap) {
        trackingSessionStore.updateMetricsForAddress(this.eventArea.id!, this.address!, metrics)
      }
    }
  },
  watch: {
    '$route.params': {
      handler(params) {
        uiStore.updateActiveElements({
          // @ts-ignore
          houseNumber: `${params.street} ${params.houseNumber}`
        })
      },
      immediate: true
    }
  },
  async created() {
    const metricsRequest = await this.$apiClient.eventMetricRecords.list({event: this.eventArea.event}, ['metric'])
    this.metricRecords = metricsRequest.payload.data
    this.metrics = metricsRequest.payload.embedded.metric
  },
  methods: {
    getMetricForId(findId: number): EventMetricDto | undefined {
      return this.metrics.find(({id}) => id === findId)
    },
    updateMetricValue(metricRecordId: number, value: string) {
      this.metricValues = {
        ...this.metricValues,
        [metricRecordId]: value
      }
    }
  }

})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

label {
  text-align: left;
}

.campaign {
  font-weight: bold;
  display: block;
}

.map {
  min-height: 180px;
  margin-bottom: 1.5em;
}

.button-group {
  margin-top: 1.5em;
}

.event-name {
  font-weight: bold;
  font-size: 1rem;
}

.full-width {
  width: 100%;
}

.headline {
  font-size: 1.2rem;
  margin: 0.5rem 0 0 0;
}

.address-headline {
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
}

.create-lead {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
}

</style>
