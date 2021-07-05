<template>
  <div class="container">
    <QForm>
      <QSelect
        v-model="localEvent.event_type"
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
        v-model="localEvent.name"
        label="Name der Aktion"
        :error-message="errors.name?.[0]"
        :error="!!errors.name?.length"
        :rules="[$validationRules.isRequired]"
      />
      <QSelect
        v-model="localEvent.campaigns"
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
      <DateTimeInput
        :input-props="{ label: 'Startdatum' }"
        :time-props="{ minuteOptions: [0, 15, 30, 45] }"
        v-model="localEvent.start_date"
        :model-value="new Date(localEvent.start_date)"
        @update:model-value="localEvent.start_date = $event.toISOString()"
        :error-message="errors.start_date?.[0]"
        :error="!!errors.start_date?.length"
      />
      <DateTimeInput
        :input-props="{ label: 'Enddatum' }"
        :time-props="{ minuteOptions: [0, 15, 30, 45] }"
        :model-value="new Date(localEvent.end_date)"
        @update:model-value="localEvent.end_date = $event.toISOString()"
        :error-message="errors.end_date?.[0]"
        :error="!!errors.end_date?.length"
        :rules="[$validationRules.isRequired]"
      />
      <QInput
        v-model="localEvent.max_participants"
        label="Maximale Teilnehmer*innenzahl"
        type="number"
        :error-message="errors.max_participants?.[0]"
        :error="!!errors.max_participants?.length"
      />
      <QInput
        type="textarea"
        label="Beschreibung"
        v-model="localEvent.description"
      />

      <QSelect
        label="Sichtbarkeit"
        v-model="localEvent.visibility"
        :options="Object.values(VisibilityOptions)"
        :option-label="(item) => VisibilityLabels[item]"
        :error-message="errors.visibility?.[0]"
        :error="!!errors.visibility?.length"
      />

      <QSelect
        label="Metriken"
        v-model="selectedMetrics"
        :options="availableMetricOptions"
        option-label="name"
        placeholder="Metriken auswählen"
        :multiple="true"
        :error-message="errors.metrics?.[0]"
        :error="!!errors.metrics?.length"
      >
        <template v-slot:selected-item="scope">
          <MetricSelectChip
            :metric="scope.opt"
            :scope="scope"
            :tabindex="scope.tabindex"
            :mandatory="scope.opt.mandatory_for_types.includes(event.event_type)"
          />
        </template>
      </QSelect>

      <div
        v-for="metricRecord in eventMetricRecords"
        :key="metricRecord.id"
      >
        <QInput
          type="number"
          :label="`Zielvorgabe für ${metricForMetricRecord(metricRecord)?.name}`"
          v-model="metricRecord.target"
        />
      </div>
      <div class="control-buttons">
        <QBtn
          flat
          label="Abbrechen"
          @click="$router.go(-1)"
        />
        <QBtn
          type="submit"
          v-if="editMode"
          label="Speichern und zurück"
          color="primary"
          :disabled="isSubmitting"
          @click.prevent.stop="saveAndClose"
        />
        <QBtn
          type="submit"
          :disabled="isSubmitting"
          color="primary"
          label="Treffpunkt auswählen"
          @click.prevent.stop="saveAndProceed"
        />
      </div>
    </QForm>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { eventTypeOptions } from 'src/api/model/EventTypes'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import { EventDto, VisibilityLabels, VisibilityOptions } from 'src/api/model/EventDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { date, QBtn, QForm, QInput, QSelect } from 'quasar'
import DateTimeInput from 'components/DateTimeInput.vue'
import MetricSelectChip from 'components/MetricSelectChip.vue'

/**
 * The details form of an event in this state the event can be either new (no id) or existing (has id)
 * After entering the details the event is saved, as subsequent steps rely on the event already been created on the API
 */
export default defineComponent({
  name: 'EditEventDetails',
  components: {
    MetricSelectChip,
    DateTimeInput,
    QBtn,
    QForm,
    QSelect,
    QInput
  },
  mixins: [EditEventMixin],
  emits: ['update:eventMetricRecords'],
  data() {
    return {
      VisibilityLabels,
      VisibilityOptions,
      metrics: [] as EventMetricDto[],
      errors: {},
      isSubmitting: false
    }
  },
  computed: {
    eventTypes() {
      return eventTypeOptions
    },
    endDate: {
      get(): Date | undefined {
        return new Date(this.localEvent.end_date!)
      },
      set(value: Date) {
        this.localEvent.end_date = value.toISOString()
      }
    },
    startDate: {
      get(): Date {
        return new Date(this.localEvent.start_date!)
      },
      set(value: Date) {
        this.localEvent.start_date = value.toISOString()
      }
    },
    availableMetricOptions(): EventMetricDto[] {
      // do not offer mandatory metrics that already are selected in the select dialog, so they can't be delselected
      return this.metrics.filter((item) =>
        !item.mandatory_for_types.includes(this.event.event_type!)
          || !this.selectedMetrics.find(({id}) => id === item.id)
      )
    },
    selectedMetrics: {
      get(): EventMetricDto[] {
        const metricRecordMetricIds = this.eventMetricRecords.map(({metric}) => metric)
        return this.metrics.filter(({id}) => {
          return metricRecordMetricIds.includes(id)
        })
      },
      set(metrics: EventMetricDto[]) {
        this.$emit('update:eventMetricRecords', metrics.map((metricItem) => {
          const existingRecord = this.eventMetricRecords.find(({metric}) => metric == metricItem.id)
          return existingRecord ?? {
            metric: metricItem.id,
            event: this.event.id,
            target: 0
          }
        }))
      }
    }
  },
  watch: {
    startDate() {
      this.fixEndDateAfterStartDate()
    },
    endDate() {
      this.fixEndDateAfterStartDate()
    },
    'event.event_type': {
      handler() {
        this.selectMandatoryMetrics()
      }
    }
  },
  async created() {
    await this.getMetrics()
    if (!this.event.id) {
      this.selectMandatoryMetrics()
    }
    if (!this.localEvent.start_date) {
      const initialDate = new Date()
      initialDate.setHours(initialDate.getHours() + Math.round(initialDate.getMinutes() / 60))
      initialDate.setMinutes(0, 0, 0)
      this.localEvent.start_date = initialDate.toISOString()
    }

    if (!this.localEvent.end_date) {
      const initialDate = new Date(this.localEvent.start_date)
      initialDate.setHours(initialDate.getHours() + 1)
      this.localEvent.end_date = initialDate.toISOString()
    }
  },
  methods: {
    fixEndDateAfterStartDate() {
      if (this.endDate! < this.startDate) {
        this.endDate = date.addToDate(new Date(this.startDate), {hours: 1})
      }
    },
    selectMandatoryMetrics() {
      const mandatoryMetrics = this.metrics
        .filter(({mandatory_for_types}) => mandatory_for_types.includes(this.localEvent.event_type!))
      this.$emit('update:eventMetricRecords', mandatoryMetrics.map((metric) => {
        return {
          metric: metric.id,
          event: this.event.id,
          target: 0
        }
      }))
    },
    async getMetrics() {
      const metricsRequest = await this.$apiClient.eventMetrics.list()
      this.metrics = metricsRequest.payload.data
    },
    async save(eventData: Partial<EventDto>) {
      let newEvent
      if (!eventData.id) {
        newEvent = this.localEvent = (await this.$apiClient.events.create({
          ...eventData,
          // need to supply the metrics during creation to pass validation
          metrics: this.selectedMetrics.map(({id}) => id)
        })).payload.data
      } else {
        newEvent = this.localEvent = (await this.$apiClient.events.update(eventData.id.toString(), {
          ...(eventData as EventDto),
          metrics: this.selectedMetrics.map(({id}) => id)
        })).payload.data
      }
      await this.$apiClient.events.batchUpdateMetricRecords(newEvent.id.toString(), this.eventMetricRecords)
      return newEvent
    },
    async saveEvent(): Promise<boolean> {
      this.isSubmitting = true
      this.errors = {}
      try {
        await this.save(this.localEvent)
        return true
      } catch (e) {
        if (e.response?.status === 400) {
          this.errors = e.response.data
        } else {
          this.errors = {
            'non-field-error': 'Ein unbekannter Fehler ist aufgetreten'
          }
        }
        return false
      } finally {
        this.isSubmitting = false
      }
    },
    async saveAndProceed() {
      const success = await this.saveEvent()
      if (success) {
        await this.$router.push({
          name: 'edit-event-location',
          params: {
            id: this.localEvent.id!.toString()
          }
        })
      }
    },
    async saveAndClose() {
      const success = await this.saveEvent()
      if (success) {
        await this.$router.push({
          name: 'event-detail',
          params: {
            id: this.localEvent.id!.toString()
          }
        })
      }
    },
    metricForMetricRecord(record: EventMetricRecordDto): EventMetricDto | undefined {
      return this.metrics.find(({id}) => record.metric === id)
    },
    metricRecordForMetricId(metricId: number): Partial<EventMetricRecordDto> | undefined {
      return this.eventMetricRecords.find(({metric}) => metricId === metric)
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
</style>
