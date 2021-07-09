<template>
  <div class="container">
    <QForm>
      <QSelect
        filled
        v-model="event.event_type"
        label="Aktionstyp"
        :disabled="true"
        :options="eventTypes"
        option-label="label"
        option-value="key"
        emit-value
        map-options
        :error-message="errors.event_type?.[0]"
        :error="!!errors.event_type?.length"
      />
      <QInput
        filled
        v-model="event.name"
        label="Name der Aktion"
        :error-message="errors.name?.[0]"
        :error="!!errors.name?.length"
        :rules="[$validationRules.isRequired]"
      />
      <QSelect
        filled
        v-model="event.campaigns"
        label="Kampagne"
        placeholder="Wähle eine Kampagne aus"
        :multiple="true"
        :options="campaigns"
        option-label="name"
        option-value="id"
        map-options
        emit-value
        :error-message="errors.campaigns?.[0]"
        :error="!!errors.campaigns?.length"
      />
      <div class="row q-col-gutter-x-md">
        <DateTimeInput
          class="col"
          filled
          :input-props="{ label: 'Startdatum' }"
          :time-props="{ minuteOptions: [0, 15, 30, 45] }"
          v-model="event.start_date"
          :model-value="new Date(event.start_date)"
          @update:model-value="event.start_date = $event.toISOString()"
          :error-message="errors.start_date?.[0]"
          :error="!!errors.start_date?.length"
        />
        <DateTimeInput
          class="col"
          filled
          :input-props="{ label: 'Enddatum' }"
          :time-props="{ minuteOptions: [0, 15, 30, 45] }"
          :model-value="new Date(event.end_date)"
          @update:model-value="event.end_date = $event.toISOString()"
          :error-message="errors.end_date?.[0]"
          :error="!!errors.end_date?.length"
          :rules="[$validationRules.isRequired]"
        />
      </div>
      <QInput
        v-model.number="event.max_participants"
        label="Maximale Teilnehmer*innenzahl"
        type="number"

        :error-message="errors.max_participants?.[0]"
        :error="!!errors.max_participants?.length"
      />
      <QInput
        type="textarea"
        label="Beschreibung"
        v-model="event.description"
      />

      <QSelect
        label="Sichtbarkeit"
        v-model="event.visibility"
        :options="Object.values(VisibilityOptions)"
        :option-label="(item) => VisibilityLabels[item]"
        :error-message="errors.visibility?.[0]"
        :error="!!errors.visibility?.length"
      />

      <h3 class="metrics-headline">Metriken</h3>
      <div class="metrics-input-wrapper">
        <MetricInput
          v-for="metric in metrics"
          :key="metric.id"
          :name="metric.name"
          :checked="selectedMetricsIds.includes(metric.id)"
          @update:checked="toggleMetric($event, metric)"
          :target="metricRecordForMetricId(metric.id)?.target ?? 0"
          @update:target="metricRecordForMetricId(metric.id).target = $event"
        />
      </div>
    </QForm>
  </div>
  <SidebarBottomNavigation
    class="navigation"
    @close="close"
    @forward="forward"
    @back="back"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { eventTypeOptions } from 'src/api/model/EventTypes'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import { VisibilityLabels, VisibilityOptions } from 'src/api/model/EventDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { date, QForm, QInput, QSelect } from 'quasar'
import DateTimeInput from 'components/DateTimeInput.vue'
import SidebarBottomNavigation from 'components/SidebarBottomNavigation.vue'
import MetricInput from 'components/MetricInput.vue'
import { editEventStore } from 'src/store/EditEventStore'
import { SettleDebouncer } from 'src/utils/debounce'
import { cloneDeep, isEqual } from 'lodash-es'
import EditEventAutoSaveMixin from 'pages/edit-event/EditEventAutoSaveMixin'

export default defineComponent({
  name: 'EditEventDetails',
  components: {
    MetricInput,
    SidebarBottomNavigation,
    DateTimeInput,
    QForm,
    QSelect,
    QInput
  },
  mixins: [EditEventMixin, EditEventAutoSaveMixin],
  emits: ['update:eventMetricRecords'],
  data() {
    return {
      metricsSaveDebouncer: new SettleDebouncer(),
      VisibilityLabels,
      VisibilityOptions,
      metrics: [] as EventMetricDto[],
      errors: {},
      isSubmitting: false,
      lastSavedMetricRecords: null as EventMetricRecordDto[] | null
    }
  },
  computed: {
    eventTypes() {
      return eventTypeOptions
    },
    endDate: {
      get(): Date | undefined {
        return new Date(this.event.end_date)
      },
      set(value: Date) {
        this.event.end_date = value.toISOString()
      }
    },
    startDate: {
      get(): Date {
        return new Date(this.event.start_date)
      },
      set(value: Date) {
        this.event.start_date = value.toISOString()
      }
    },
    availableMetricOptions(): EventMetricDto[] {
      // do not offer mandatory metrics that already are selected in the select dialog, so they can't be delselected
      return this.metrics.filter((item) =>
        !item.mandatory_for_types.includes(this.event.event_type)
        || !this.selectedMetrics.find(({id}) => id === item.id)
      )
    },
    selectedMetrics: {
      get(): EventMetricDto[] {
        const metricRecordMetricIds = this.metricRecords.map(({metric}) => metric)
        return this.metrics.filter(({id}) => {
          return metricRecordMetricIds.includes(id)
        })
      },
      set(metrics: EventMetricDto[]) {
        editEventStore.setMetricRecords(metrics.map((metricItem) => {
          const existingRecord = this.metricRecords.find(({metric}) => metric == metricItem.id)
          return existingRecord ?? {
            metric: metricItem.id,
            event: this.event.id,
            target: 0
          } as EventMetricRecordDto
        }))
      }
    },
    selectedMetricsIds(): number[] {
      return this.selectedMetrics.map(({id}) => id)
    },
    currentMetricRecords(): EventMetricRecordDto[] {
      return cloneDeep(this.metricRecords)
    }
  },
  watch: {
    startDate() {
      this.fixEndDateAfterStartDate()
    },
    endDate() {
      this.fixEndDateAfterStartDate()
    },
    metricRecords: {
      handler(newValue) {
        void this.metricsSaveDebouncer.executeDebounced(async () => {
          if (!isEqual(newValue, this.lastSavedMetricRecords)) {
            await this.updateMetrics()
          }
        })
      },
      deep: true
    }
  },
  async created() {
    await this.getMetrics()
    this.lastSavedMetricRecords = cloneDeep(this.metricRecords)
    if (!this.event.start_date) {
      const initialDate = new Date()
      initialDate.setHours(initialDate.getHours() + Math.round(initialDate.getMinutes() / 60))
      initialDate.setMinutes(0, 0, 0)
      this.event.start_date = initialDate.toISOString()
    }

    if (!this.event.end_date) {
      const initialDate = new Date(this.event.start_date)
      initialDate.setHours(initialDate.getHours() + 1)
      this.event.end_date = initialDate.toISOString()
    }
  },
  methods: {
    async updateMetrics() {
      try {
        const metricRecordsRequest = await this.$apiClient.events.batchSetMetricRecords(
          this.event.id.toString(), this.metricRecords
        )
        this.lastSavedMetricRecords = cloneDeep(metricRecordsRequest.payload.data)
        this.metricRecords = cloneDeep(metricRecordsRequest.payload.data)
        this.$q.notify({
          color: 'positive',
          message: 'Metriken gespeichert'
        })
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          message: 'Die Metriken konnten nicht gespeichert werden'
        })
      }
    },
    fixEndDateAfterStartDate() {
      if (this.endDate! < this.startDate) {
        this.endDate = date.addToDate(new Date(this.startDate), {hours: 1})
      }
    },
    toggleMetric(enable: boolean, metric: EventMetricDto) {
      if (enable && !this.selectedMetrics.find(({id}) => id === metric.id)) {
        this.selectedMetrics = [...this.selectedMetrics, metric]
      } else {
        this.selectedMetrics = this.selectedMetrics.filter(({id}) => id !== metric.id)
      }
    },
    async getMetrics() {
      const metricsRequest = await this.$apiClient.eventMetrics.list()
      this.metrics = metricsRequest.payload.data
    },
    async back() {
      await this.saveDebouncer.waitForSettle()
      this.$router.go(-1)
    },
    async forward() {
      await this.saveDebouncer.waitForSettle()
      await this.$router.push({
        name: 'edit-event-geometry'
      })
    },
    async close() {
      await this.$router.push({
        name: 'event-detail',
        params: {
          id: this.event.id.toString()
        }
      })
    },
    metricForMetricRecord(record: EventMetricRecordDto): EventMetricDto | undefined {
      return this.metrics.find(({id}) => record.metric === id)
    },
    metricRecordForMetricId(metricId: number): Partial<EventMetricRecordDto> | undefined {
      return this.metricRecords.find(({metric}) => metricId === metric)
    },
    isRequired(value: string) {
      if (!value) {
        return 'Bitte fülle dieses Feld aus'
      }
      return true
    }
  }
})
</script>

<style lang="scss" scoped>
.control-buttons {
  margin: 1rem 0;
}

.metrics-headline {
  font-size: 1.2rem;
  margin: 0;
}

.metrics-input-wrapper {
  display: flex;
  flex-direction: column;
  background: $grey-2;
}

.container {
  flex: 1;
  margin-top: 1rem;
}
</style>
