<template>
  <QScrollArea class="d-flex flex-fill column q-py-sm">
    <div class="create-lead">
      <QBtn :to="{ name: 'create-lead' }" outline color="primary">
        Kontakt registrieren
      </QBtn>
    </div>

    <div v-if="metricRecords.length">
      <MetricsRow
        v-for="metricRecord in metricRecords"
        :key="metricRecord.metric"
        :model-value="metricValues[metricRecord.id]"
        :label="getMetricForId(metricRecord.metric)!.name"
        class="metrics-input"
        @update:modelValue="updateMetricValue(metricRecord.id, $event)"
      />
    </div>
    <p v-else>Für diese Aktion wurden keine Ergebnisse definiert</p>
  </QScrollArea>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import {
  MetricValueMap,
  trackingSessionStore
} from 'src/store/TrackingSessionStore'
import MetricsRow from 'src/components/MetricsRow.vue'
import { uiStore } from 'src/store/UiStore'
import { QBtn, QScrollArea } from 'quasar'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { useEventAreaMetricsComposable } from 'pages/event-map/detail/area/metrics/EventAreaMetricsMixin'

export default defineComponent({
  name: 'EventAreaMetrics',
  props: {
    houseNumber: {
      type: String as PropType<string>,
      required: true
    },
    street: {
      type: String as PropType<string>,
      required: true
    },
    areaId: {
      type: String as PropType<string>,
      required: true
    }
  },
  components: {
    MetricsRow,
    QBtn,
    QScrollArea
  },
  setup(props) {
    const { eventArea } = useEventDetailStore()
    const { address } = useEventAreaMetricsComposable(props)
    return { eventArea, address }
  },
  data() {
    return {
      metricRecords: [] as EventMetricRecordDto[],
      metrics: [] as EventMetricDto[]
    }
  },
  computed: {
    metricValues: {
      get(): MetricValueMap {
        const storedValues = trackingSessionStore.getMetricsForAddress(
          this.eventArea.id!,
          this.address!
        )
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
      async set(metrics: MetricValueMap) {
        await trackingSessionStore.updateMetricsForAddress(
          this.eventArea.id!,
          this.address!,
          metrics
        )
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
    const metricsRequest = await this.$apiClient.eventMetricRecords.list(
      { event: this.eventArea.event },
      ['metric']
    )
    this.metricRecords = metricsRequest.payload.data
    this.metrics = metricsRequest.payload.embedded.metric
  },
  methods: {
    getMetricForId(findId: number): EventMetricDto | undefined {
      return this.metrics.find(({ id }) => id === findId)
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
}

.metrics-input {
  margin: 0.7rem 0 0;
}
</style>
