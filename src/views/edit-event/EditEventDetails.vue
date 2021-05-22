<template>
  <div class="container">
    <Form
      v-slot="{ errors, isSubmitting, handleSubmit }"
      :initial-values="localEvent"
    >
      <div class="p-fluid">
        <div class="p-field p-grid">
          <label
            for="eventType"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Event-Typ</label>
          <div class="p-col-12 p-md-9">
            <Field
              v-slot="{ field, handleChange }"
              name="event_type"
            >
              <Dropdown
                id="eventType"
                :model-value="field.value"
                :disabled="true"
                :options="eventTypes"
                option-label="label"
                option-value="key"
                placeholder="Aktions-Typ"
                @input="handleChange($event.value.map(({key}) => key))"
              />
              <ErrorMessage
                class="error"
                name="event_type"
              />
            </Field>
          </div>
        </div>
        <div class="p-field p-grid">
          <label
            for="eventName"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Name der Aktion</label>
          <div class="p-col-12 p-md-9">
            <Field
              v-slot="{field}"
              name="name"
              :rules="isRequired"
            >
              <InputText
                id="eventName"
                v-bind="field"
                name="name"
                type="text"
                :class="{ 'p-invalid': errors.name }"
              />
              <ErrorMessage
                name="name"
                class="error"
              />
            </Field>
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="campaigns"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Kampagnenauswahl</label>
          <div class="p-col-12 p-md-9">
            <Field
              v-slot="{ field }"
              name="campaigns"
              :rules="isRequired"
            >
              <MultiSelect
                :options="campaigns"
                option-value="id"
                option-label="name"
                placeholder="Wähle eine Kampagne aus"
                :model-value="field.value"
                :class="{ 'p-invalid': errors.campaigns }"
                @input="field.onInput.forEach((fn) => fn($event.value))"
                @change="field.onChange.forEach((fn) => fn($event.value))"
              />
              <ErrorMessage
                name="campaigns"
                class="error"
              />
            </Field>
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="start_date"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Beginn</label>
          <div class="p-col-12 p-md-9">
            <Field
              v-slot="{ field, handleChange }"
              name="start_date"
              :rules="isRequired"
            >
              <Calendar
                date-format="dd.mm.yy"
                :show-time="true"
                :model-value="new Date(field.value)"
                :class="{'p-invalid': errors.start_date}"
                :step-minute="15"
                @date-select="handleChange($event.toISOString())"
              />
              <ErrorMessage
                name="start_date"
                class="error"
              />
            </Field>
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="end_date"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Ende</label>
          <div class="p-col-12 p-md-9">
            <Field
              v-slot="{ field, handleChange }"
              name="end_date"
              :rules="isRequired"
            >
              <Calendar
                date-format="dd.mm.yy"
                :show-time="true"
                :step-minute="15"
                :model-value="new Date(field.value)"
                @date-select="handleChange($event.toISOString())"
              />
              <ErrorMessage
                name="end_date"
                class="error"
              />
            </Field>
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="max_participants"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          ># Personen</label>
          <Field
            v-slot="{ field, handleChange }"
            name="max_participants"
          >
            <div class="p-col-12 p-md-9">
              <InputNumber
                id="max_participants"
                show-buttons
                name="max_participants"
                mode="decimal"
                :value="field.value"
                :min="0"
                @input="handleChange($event.value)"
              />
              <ErrorMessage
                name="max_participants"
                class="error"
              />
            </div>
          </Field>
        </div>

        <div class="p-field p-grid p-align-start">
          <label
            for="eventDescription"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Weitere Informationen</label>
          <Field
            v-slot="{ field }"
            name="description"
          >
            <div class="p-col-12 p-md-9">
              <Textarea
                id="eventDescription"
                v-bind="field"
                type="text"
              />
            </div>
          </Field>
        </div>

        <div class="p-field p-grid">
          <label
            for="eventMetrics"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Felder (geklopfte Türen etc.) auswählen</label>

          <div class="p-col-12 p-md-9">
            <Field
              v-slot="{ handleChange }"
              name="metrics"
            >
              <MultiSelect
                v-model="selectedMetrics"
                :options="metrics"
                option-label="name"
                placeholder="Metriken auswählen"
                display="chip"
                @change="handleChange($event.value.map(({id}) => id))"
              />
              <ErrorMessage
                name="metrics"
                class="error"
              />
            </Field>
          </div>
        </div>
        <div
          v-for="metricRecord in eventMetricRecords"
          :key="metricRecord.id"
        >
          <div class="p-field p-grid">
            <label
              for="eventGoals"
              class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
            >Zielvorgabe für {{ metricForMetricRecord(metricRecord)?.name }} hinzufügen</label>
            <div class="p-col-12 p-md-9">
              <InputNumber
                v-model="metricRecord.target"
                show-buttons
                :min="0"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="control-buttons">
        <Button
          class="p-button-text"
          label="Abbrechen"
          @click="$router.go(-1)"
        />
        <Button
          v-if="editMode"
          label="Speichern und zurück"
          :disabled="isSubmitting"
          @click="handleSubmit($event, saveAndClose)"
        />
        <Button
          type="submit"
          :disabled="isSubmitting"
          label="Treffpunkt auswählen"
          @click="handleSubmit($event, saveAndProceed)"
        />
      </div>
    </Form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'

import { eventTypeOptions } from '@/api/model/EventTypes'
import EditEventMixin from '@/views/edit-event/EditEventMixin'
import { EventDto } from '@/api/model/EventDto'
import { EventMetricRecordDto } from '@/api/model/EventMetricRecordDto'
import { EventMetricDto } from '@/api/model/EventMetricDto'

import { Form, Field, ErrorMessage, FormActions } from 'vee-validate'
import Textarea from 'primevue/textarea'

/**
 * The details form of an event in this state the event can be either new (no id) or existing (has id)
 * After entering the details the event is saved, as subsequent steps rely on the event already been created on the API
 */
export default defineComponent({
  name: 'EditEventDetails',
  components: {
    InputText,
    Dropdown,
    Calendar,
    Button,
    InputNumber,
    MultiSelect,
    Textarea,
    Form,
    Field,
    ErrorMessage
  },
  mixins: [EditEventMixin],
  emits: ['update:eventMetricRecords'],
  data() {
    return {
      metrics: [] as EventMetricDto[],
      zoom: 6,
      iconWidth: 25,
      iconHeight: 40,
      center: {lat: 51.5, lng: 10}
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
  async created() {
    await this.getMetrics()
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
        newEvent = this.localEvent = (await this.$apiClient.events.update(eventData.id!.toString(), {
          ...(eventData as EventDto),
          metrics: this.selectedMetrics.map(({id}) => id)
        })).payload.data
      }
      await this.$apiClient.events.batchUpdateMetricRecords(newEvent.id.toString(), this.eventMetricRecords)
      return newEvent
    },
    async saveEvent(values: Partial<EventDto>, actions: FormActions<any>): Promise<boolean> {
      try {
        await this.save({
          ...this.localEvent,
          ...values
        })
        actions.resetForm({values: this.localEvent, errors: {}})
        return true
      } catch (e) {
        console.dir(e)
        if (e.status == 400) {
          actions.setErrors(e.data)
        } else {
          actions.setErrors({
            'non-field-error': 'Ein unbekannter Fehler ist aufgetreten'
          })
        }
        return false
      }
    },
    async saveAndProceed(values: Partial<EventDto>, actions: FormActions<any>) {
      const success = await this.saveEvent(values, actions)
      if (success) {
        await this.$router.push({
          name: 'edit-event-location',
          params: {
            id: this.localEvent.id!.toString()
          }
        })
      }
    },
    async saveAndClose(values: Partial<EventDto>, actions: FormActions<any>) {
      const success = await this.saveEvent(values, actions)
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
label {
  text-align: left;
}

:deep(.p-dialog) {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 960px;
}

Button {
  margin: 10px;
}

.map-location-chooser {
  height: 50vh;
  width: 100%;
  max-width: 960px;
}

</style>
