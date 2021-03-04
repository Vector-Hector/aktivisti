<template>
  <h2>{{ street }} {{ houseNumber }}</h2>
  <div
    v-for="metricRecord in metricRecords"
    :key="metricRecord.name"
    class="metrics-input"
  >
    <h3>{{ getMetricForId(metricRecord.metric).name }}</h3>
    <CounterInput
      :model-value="metricValues[metricRecord.id]"
      @update:modelValue="updateMetricValue(metricRecord.id, $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import CounterInput from '@/components/CounterInput.vue'
import { EventMetricRecordDto } from '@/api/model/EventMetricRecordDto'
import { EventMetricDto } from '@/api/model/EventMetricDto'
import { MetricValueMap, trackingSessionStore } from '@/store/TrackingSessionStore'


export default defineComponent({
  name: 'EventAreaLiveMetrics',
  components: {
    CounterInput
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
        trackingSessionStore.collectMetricsForAddress(this.eventArea.id!, this.address, metrics)
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
