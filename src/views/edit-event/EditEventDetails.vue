<template>
  <div class="container">
    <h2>Neues Event hinzufügen</h2>
    <Form
      @submit="saveAndProceed()"
    >
      <div class="p-fluid">
        <div class="p-field p-grid">
          <label
            for="eventType"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Event-Typ</label>
          <div class="p-col-12 p-md-9">
            <Dropdown
              id="eventType"
              v-model="localEvent.event_type"
              :disabled="true"
              :options="eventTypes"
              option-label="label"
              option-value="key"
              placeholder="Event-Typ"
            />
          </div>
        </div>
        <div class="p-field p-grid">
          <label
            for="eventName"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Name des Events</label>
          <div class="p-col-12 p-md-9">
            <!-- <Field
              v-slot="{field}"
              name="name"
              :rules="isRequired"
            >
              <InputText
                id="eventName"
                v-model="localEvent.name"
                name="name"
                v-bind="field"
                type="text"
              />
              <ErrorMessage
                name="name"
                class="error"
              />
            </Field> -->
            <InputText
              id="eventName"
              v-model="localEvent.name"
              type="text"
            />
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="campaign"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Kampagnenauswahl</label>
          <div class="p-col-12 p-md-9">
            <Field
              v-slot="{ field }"
              v-model="localEvent.campaign"
              name="campaign"
              :rules="isRequired"
            >
              <Dropdown
                :options="campaigns"
                option-value="id"
                option-label="name"
                placeholder="Wähle eine Kampagne aus"
                v-bind="field"
              />
            </Field>
            <ErrorMessage
              name="campaign"
              class="error"
            />
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="startDate"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Beginn</label>
          <div class="p-col-12 p-md-9">
            <Calendar
              v-model="startDate"
              date-format="dd.mm.yy"
              :show-time="true"
            />
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="endDate"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Ende</label>
          <div class="p-col-12 p-md-9">
            <Calendar
              v-model="endDate"
              date-format="dd.mm.yy"
              :show-time="true"
            />
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="eventParticipantsMax"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          ># Personen</label>
          <div class="p-col-12 p-md-9">
            <InputNumber
              id="eventParticipantsMax"
              v-model="localEvent.max_participants"
              show-buttons
              mode="decimal"
              :min="0"
            />
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="eventInfo"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Weitere Informationen</label>
          <div class="p-col-12 p-md-9">
            <InputText
              id="eventInfo"
              v-model="localEvent.info"
              type="text"
            />
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="eventMetrics"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Felder (geklopfte Türen etc.) auswählen</label>
          <div class="p-col-12 p-md-9">
            <MultiSelect
              v-model="selectedMetrics"
              :options="metrics"
              option-label="name"
              placeholder="Metriken auswählen"
              display="chip"
            />
          </div>
        </div>

        <div
          v-for="metricRecord in metricRecords"
          :key="metricRecord.id"
        >
          <div class="p-field p-grid">
            <label
              for="eventGoals"
              class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
            >Zielvorgabe für {{ metricForMetricRecord(metricRecord).name }} hinzufügen</label>
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
        <router-link to="/events">
          <Button
            class="p-button-text"
            label="Abbrechen"
          />
        </router-link>
        <Button
          type="submit"
          label="Ort auswählen"
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

import { Form, Field, ErrorMessage } from 'vee-validate'

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
    Form,
    Field,
    ErrorMessage,
  },
  mixins: [EditEventMixin],
  data() {
    return {
      metrics: [] as EventMetricDto[],
      metricRecords: [] as Partial<EventMetricRecordDto>[],
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
        if (this.localEvent.end_date) {
          return new Date(this.localEvent.end_date)
        } else {
          return undefined
        }
      },
      set(value: Date) {
        this.localEvent.end_date = value.toISOString()
      }
    },
    startDate: {
      get(): Date | undefined {
        if (this.localEvent.start_date) {
          return new Date(this.localEvent.start_date)
        } else {
          return undefined
        }
      },
      set(value: Date) {
        this.localEvent.start_date = value.toISOString()
      }
    },
    selectedMetrics: {
      get(): EventMetricDto[] {
        const metricRecordMetricIds = this.metricRecords.map(({metric}) => metric)
        return this.metrics.filter(({id}) => {
          return metricRecordMetricIds.includes(id)
        })
      },
      set(metrics: EventMetricDto[]) {
        this.metricRecords = metrics.map((metricItem) => {
          const existingRecord = this.metricRecords.find(({metric}) => metric == metricItem.id)
          return existingRecord ?? {
            metric: metricItem.id,
            event: this.event.id,
            target: 0
          }
        })
      }
    }
  },
  async created() {
    await this.getMetrics()
    if (this.event.id) {
      await this.getMetricRecords()
    }
  },
  methods: {
    async getMetrics() {
      const metricsRequest = await this.$apiClient.eventMetrics.list()
      this.metrics = metricsRequest.payload.data
    },
    async getMetricRecords() {
      const metricRecordsRequest = await this.$apiClient.eventMetricRecords.list({event: this.event.id})
      this.metricRecords = metricRecordsRequest.payload.data
    },
    async saveAndProceed() {
      let newEvent
      if (!this.localEvent.id) {
        newEvent = this.localEvent = (await this.$apiClient.events.create(this.localEvent)).payload.data
      } else {
        newEvent = this.localEvent = (await this.$apiClient.events.update(this.localEvent!.id!.toString(), this.localEvent as EventDto)).payload.data
      }
      await this.$apiClient.events.batchUpdateMetricRecords(newEvent.id.toString(), this.metricRecords)

      this.$router.push({
        name: 'edit-event-location',
        params: {
          id: newEvent.id.toString()
        }
      })
    },
    metricForMetricRecord(record: EventMetricRecordDto): EventMetricDto | undefined {
      return this.metrics.find(({id}) => record.metric === id)
    },
    metricRecordForMetricId(metricId: number): Partial<EventMetricRecordDto> | undefined {
      return this.metricRecords.find(({metric}) => metricId === metric)
    },
    isRequired (value: string) {
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
