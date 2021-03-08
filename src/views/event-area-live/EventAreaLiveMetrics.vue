<template>
  <h2>
    Ergebnisse für: {{ street }} {{ houseNumber }}
  </h2>
  <IonGrid
    v-if="metricRecords.length"
  >
    <MetricsRow
      v-for="metricRecord in metricRecords"
      :key="metricRecord.name"
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
import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { EventMetricRecordDto } from '@/api/model/EventMetricRecordDto'
import { EventMetricDto } from '@/api/model/EventMetricDto'
import { MetricValueMap, trackingSessionStore } from '@/store/TrackingSessionStore'
import { IonGrid, IonText } from '@ionic/vue'
import MetricsRow from '@/components/MetricsRow.vue'


export default defineComponent({
  name: 'EventAreaLiveMetrics',
  components: {
    MetricsRow,
    IonGrid,
    IonText
  },
  props: {
    eventArea: {
      type: Object as PropType<EventAreaDto>,
      required: true
    },
    houseNumber: {
      type: String as PropType<string>,
      required: true
    },
    street: {
      type: String as PropType<string>,
      required: true
    }
  },
  data() {
    return {
      metricRecords: [] as EventMetricRecordDto[],
      metrics: [] as EventMetricDto[]
    }
  },
  computed: {
    address(): string {
      return `${this.street} ${this.houseNumber}`
    },
    metricValues: {
      get(): MetricValueMap {
        const storedValues = trackingSessionStore.getMetricsForAddress(this.eventArea.id!, this.address)
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
        trackingSessionStore.updateMetricsForAddress(this.eventArea.id!, this.address, metrics)
      }
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

</style>
