<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import {
  MetricValueMap,
  trackingSessionStore
} from 'src/store/TrackingSessionStore'
import MetricsRow from 'src/components/MetricsRow.vue'
import { uiStore } from 'src/store/UiStore'
import { QBtn, QScrollArea, useQuasar } from 'quasar'
import { useEventStore } from 'src/stores/event'
import { useEventAreaMetricsComposable } from 'pages/event-map/detail/area/metrics/EventAreaMetricsMixin'
import { useRoute } from 'vue-router'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'

interface Props {
  houseNumber: string
  street: string
  areaId: string
}

const props = defineProps<Props>()

const $q = useQuasar()
const $route = useRoute()
const eventStore = useEventStore()
const { address } = useEventAreaMetricsComposable(props)
const { t } = useI18n()

const metricRecords = ref<EventMetricRecordDto[]>([])
const metrics = ref<EventMetricDto[]>([])

onMounted(async () => {
  const metricsRequest = await apiClient.eventMetricRecords.list(
    { event: eventStore.eventArea.event },
    ['metric']
  )
  metricRecords.value = metricsRequest.payload.data
  metrics.value = metricsRequest.payload.embedded.metric
})

const metricValues = computed({
  get() {
    const storedValues = trackingSessionStore.getMetricsForAddress(
      eventStore.eventArea.id!,
      address.value!
    )
    if (storedValues) {
      return storedValues
    } else {
      const defaultObject: MetricValueMap = {}
      for (const metricRecord of metricRecords.value) {
        defaultObject[metricRecord.id] = 0
      }
      return defaultObject
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async set(newMetrics: MetricValueMap) {
    try {
      await trackingSessionStore.updateMetricsForAddress(
        eventStore.eventArea.id!,
        address.value!,
        newMetrics
      )
    } catch (e) {
      if (apiClient.isApiClientError(e) && e.response) {
        const { status, data } = e.response
        if (status === 400 && data.event_area) {
          $q.notify({
            color: 'negative',
            message: t('events.details.area.metrics.areaNotFoundError')
          })
        }
        // TODO(peter) Handle other errors
      }
    }
  }
})

watch(
  () => $route.params,
  (params) => {
    uiStore.updateActiveElements({
      // @ts-ignore
      houseNumber: `${params.street} ${params.houseNumber}`
    })
  },
  { immediate: true }
)

function getMetricForId(findId: number): EventMetricDto | undefined {
  return metrics.value.find(({ id }) => id === findId)
}

function updateMetricValue(metricRecordId: number, value: string) {
  metricValues.value = {
    ...metricValues.value,
    [metricRecordId]: value
  }
}
</script>

<template>
  <QScrollArea class="d-flex flex-fill column q-py-sm">
    <div class="create-lead">
      <QBtn :to="{ name: 'create-lead' }" outline color="primary">
        {{ $t('events.details.area.metrics.createLead') }}
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
    <p v-else>
      {{ $t('events.details.area.metrics.noMetricsDefinedWarning') }}
    </p>
    <div v-if="eventStore.event.external_url_door" class="external-url">
      <QBtn
        :href="eventStore.event.external_url_door"
        target="_blank"
        outline
        color="primary"
      >
        {{ $t('events.details.area.metrics.openExternalUrl') }}
      </QBtn>
    </div>
  </QScrollArea>
</template>

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

.external-url {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.create-lead {
  display: flex;
  justify-content: center;
}

.metrics-input {
  margin: 0.7rem 0 0;
}
</style>
