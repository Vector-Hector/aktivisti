<template>
  <div class="container">
    <QScrollArea class="d-flex flex-fill">
      <QForm>
        <QSelect
          filled
          v-model="event.event_type"
          label="Aktionstyp"
          disable
          :option-disable="() => true"
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
            :date-props="{ navigationMinYearMonth: currentYearMonth }"
            v-model="startDate"
            :mask="mask"
            :error-message="errors.start_date?.[0]"
            :error="!!errors.start_date?.length"
          />
          <DateTimeInput
            class="col"
            filled
            :input-props="{ label: 'Enddatum' }"
            :time-props="{ minuteOptions: [0, 15, 30, 45] }"
            :date-props="{ navigationMinYearMonth: currentYearMonth }"
            v-model="endDate"
            :mask="mask"
            :error-message="errors.end_date?.[0]"
            :error="!!errors.end_date?.length"
            :rules="[$validationRules.isRequired]"
          />
        </div>
        <QInput
          filled
          v-if="event.event_type === EventTypes.GENERIC"
          v-model.number="event.external_url"
          label="Externe URL"
          :error-message="errors.external_url?.[0]"
          :error="!!errors.external_url?.length"
        />
        <QInput
          filled
          type="textarea"
          label="Beschreibung"
          v-model="event.description"
          :error-message="errors.description?.[0]"
          :error="!!errors.description?.length"
        />

        <QSelect
          filled
          v-if="event.event_type !== EventTypes.GENERIC"
          label="Sichtbarkeit"
          v-model="event.visibility"
          :options="Object.values(VisibilityOptions)"
          :option-label="(item) => VisibilityLabels[item]"
          :error-message="errors.visibility?.[0]"
          :error="!!errors.visibility?.length"
        />
        <div v-if="event.event_type === EventTypes.POSTERS">
          <QCheckbox
            v-model="event.poster_creation_allowed"
            label="Teilnehmer*innen können Plakate anlegen"
          />
        </div>
      </QForm>
    </QScrollArea>
  </div>
  <SidebarBottomStepNavigation
    class="navigation"
    @close="abort"
    @forward="next"
    @back="back"
    :last="stepControls.isLastStep.value"
  />
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'

import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'
import { useEditEventMixin } from 'src/pages/edit-event/EditEventMixin'
import { VisibilityLabels, VisibilityOptions } from 'src/api/model/EventDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { date, QCheckbox, QForm, QInput, QScrollArea, QSelect } from 'quasar'
import DateTimeInput from 'components/DateTimeInput.vue'
import SidebarBottomStepNavigation from 'components/SidebarBottomStepNavigation.vue'
import { editEventStore } from 'src/store/EditEventStore'
import { SettleDebouncer } from 'src/utils/debounce'
import { cloneDeep, isEqual } from 'lodash-es'
import { dateMaskMatches } from 'src/utils/date'
import { StepControls } from 'pages/EditEvent.vue'
import { useEditEventAutoSaveMixin } from 'pages/edit-event/EditEventAutoSaveMixin'

export default defineComponent({
  name: 'EditEventDetails',
  components: {
    SidebarBottomStepNavigation,
    DateTimeInput,
    QForm,
    QSelect,
    QInput,
    QCheckbox,
    QScrollArea
  },
  data() {
    return {
      EventTypes,
      metricsSaveDebouncer: new SettleDebouncer(),
      VisibilityLabels,
      VisibilityOptions,
      metrics: [] as EventMetricDto[],
      errors: {} as Record<string, string[]>,
      isSubmitting: false,
      lastSavedMetricRecords: null as EventMetricRecordDto[] | null,
      startDate: '',
      endDate: '',
      mask: 'DD.MM.YYYY HH:mm'
    }
  },
  computed: {
    currentYearMonth() {
      return date.formatDate(new Date(), 'YYYY/MM')
    },
    eventTypes() {
      return eventTypeOptions
    },
    availableMetricOptions(): EventMetricDto[] {
      // do not offer mandatory metrics that already are selected in the select dialog, so they can't be delselected
      return this.metrics.filter(
        (item) =>
          !item.mandatory_for_types.includes(this.event.event_type) ||
          !this.selectedMetrics.find(({ id }) => id === item.id)
      )
    },
    selectedMetrics: {
      get(): EventMetricDto[] {
        const metricRecordMetricIds = this.metricRecords.map(
          ({ metric }) => metric
        )
        return this.metrics.filter(({ id }) => {
          return metricRecordMetricIds.includes(id)
        })
      },
      set(metrics: EventMetricDto[]) {
        editEventStore.setMetricRecords(
          metrics.map((metricItem) => {
            const existingRecord = this.metricRecords.find(
              ({ metric }) => metric == metricItem.id
            )
            return (
              existingRecord ??
              ({
                metric: metricItem.id,
                event: this.event.id
              } as EventMetricRecordDto)
            )
          })
        )
      }
    },
    selectedMetricsIds(): number[] {
      return this.selectedMetrics.map(({ id }) => id)
    },
    currentMetricRecords(): EventMetricRecordDto[] {
      return cloneDeep(this.metricRecords)
    }
  },
  watch: {
    'event.start_date': {
      handler(newValue) {
        if (!newValue) {
          const initialDate = new Date()
          initialDate.setHours(
            initialDate.getHours() + Math.round(initialDate.getMinutes() / 60)
          )
          initialDate.setMinutes(0, 0, 0)
          this.startDate = date.formatDate(new Date(initialDate), this.mask)
        } else {
          this.startDate = date.formatDate(new Date(newValue), this.mask)
        }
        if (new Date(this.event.start_date) > new Date(this.event.end_date)) {
          const startDate = new Date(
            date.extractDate(this.startDate, this.mask)
          )
          const newEndDate = date.addToDate(startDate, { hours: 1 })
          this.endDate = date.formatDate(newEndDate, this.mask)
        }
      },
      immediate: true
    },
    'event.end_date': {
      handler(newValue) {
        if (!newValue) {
          const initialDate = this.event.start_date
            ? new Date(this.event.start_date)
            : new Date()
          initialDate.setHours(
            initialDate.getHours() +
              Math.round(initialDate.getMinutes() / 60) +
              1
          )
          initialDate.setMinutes(0, 0, 0)
          this.endDate = date.formatDate(new Date(initialDate), this.mask)
        } else {
          this.endDate = date.formatDate(new Date(newValue), this.mask)
        }
        if (new Date(this.event.start_date) > new Date(this.event.end_date)) {
          const endDate = new Date(date.extractDate(this.endDate, this.mask))
          const newStartDate = date.subtractFromDate(endDate, { hours: 1 })
          this.startDate = date.formatDate(newStartDate, this.mask)
        }
      },
      immediate: true
    },
    startDate(newValue) {
      if (dateMaskMatches(newValue, this.mask)) {
        const extractedDate = date.extractDate(newValue, this.mask)
        const extractedIsoDate = extractedDate.toISOString()
        if (extractedIsoDate !== this.event.start_date) {
          this.event.start_date = extractedIsoDate
        }
      } else {
        this.errors.start_date = ['Ungültiges Datum']
      }
    },
    endDate(newValue) {
      if (dateMaskMatches(newValue, this.mask)) {
        const extractedDate = date.extractDate(newValue, this.mask)
        const extractedIsoDate = extractedDate.toISOString()
        if (extractedIsoDate !== this.event.end_date) {
          this.event.end_date = extractedIsoDate
        }
      } else {
        this.errors.end_date = ['Ungültiges Datum']
      }
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
  setup() {
    const { metricRecords, campaigns, event } = useEditEventMixin()
    const { errors, saveDebouncer } = useEditEventAutoSaveMixin()
    return {
      metricRecords,
      campaigns,
      event,
      stepControls: inject('stepControls') as StepControls,
      errors,
      saveDebouncer
    }
  },
  async created() {
    await this.getMetrics()
    this.lastSavedMetricRecords = cloneDeep(this.metricRecords)
  },
  methods: {
    async updateMetrics() {
      try {
        const metricRecordsRequest =
          await this.$apiClient.events.batchSetMetricRecords(
            this.event.id.toString(),
            this.metricRecords
          )
        this.lastSavedMetricRecords = cloneDeep(
          metricRecordsRequest.payload.data
        )
        this.metricRecords = cloneDeep(metricRecordsRequest.payload.data)
        this.$q.notify({
          color: 'positive',
          message: 'Ergebnisse gespeichert'
        })
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          message: 'Die Ergebnisse konnten nicht gespeichert werden'
        })
      }
    },
    toggleMetric(enable: boolean, metric: EventMetricDto) {
      if (enable && !this.selectedMetrics.find(({ id }) => id === metric.id)) {
        this.selectedMetrics = [...this.selectedMetrics, metric]
      } else {
        this.selectedMetrics = this.selectedMetrics.filter(
          ({ id }) => id !== metric.id
        )
      }
    },
    async getMetrics() {
      const metricsRequest = await this.$apiClient.eventMetrics.list({
        available_for_types: this.event.event_type
      })
      this.metrics = metricsRequest.payload.data
    },
    async back() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.previous()
    },
    async next() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.next()
    },
    async abort() {
      await this.saveDebouncer.waitForSettle()
      this.stepControls.abort()
    },
    metricForMetricRecord(
      record: EventMetricRecordDto
    ): EventMetricDto | undefined {
      return this.metrics.find(({ id }) => record.metric === id)
    },
    metricRecordForMetricId(
      metricId: number
    ): Partial<EventMetricRecordDto> | undefined {
      return this.metricRecords.find(({ metric }) => metricId === metric)
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
