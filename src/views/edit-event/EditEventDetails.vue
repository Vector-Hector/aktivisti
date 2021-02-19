<template>
  <div class="container">
    <h2>Neues Event hinzufügen</h2>
    <div class="p-fluid">
      <div class="p-field p-grid">
        <label
          for="eventType"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Event-Typ</label>
        <div class="p-col-12 p-md-9">
          <Dropdown
            id="eventType"
            v-model="localEvent.type"
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
          <InputText
            id="eventName"
            v-model="localEvent.title"
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
          <Dropdown
            v-model="localEvent.campaign"
            :options="campaigns"
            option-value="id"
            option-label="title"
            placeholder="Wähle eine Kampagne aus"
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
            v-model="localEvent.maxParticipants"
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
            v-model="localEvent.metrics"
            :options="metrics"
            option-label="name"
            placeholder="Metriken auswählen"
            display="chip"
          />
        </div>
      </div>

      <div v-if="localEvent.metrics.length > 0">
        <div
          v-for="metric in localEvent.metrics"
          :key="metric.name"
        >
          <div class="p-field p-grid">
            <label
              for="eventGoals"
              class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
            >Zielvorgabe für {{ metric.name }} hinzufügen</label>
            <div class="p-col-12 p-md-9">
              <InputNumber
                v-model="localEvent.targets[metric.name]"
                show-buttons
                :min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="eventTasks"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Aufgabenbeschreibung</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="eventTasks"
            v-model="localEvent.tasks"
            type="text"
          />
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="eventInfoLink"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Link zu Info-Material</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="eventInfoLink"
            v-model="localEvent.infoLink"
            type="text"
          />
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="eventContact"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Kontakt (Telefon, E-Mail)</label>
        <div class="p-col-12 p-md-9">
          <InputText
            id="eventContact"
            v-model="localEvent.contact"
            type="text"
          />
        </div>
      </div>
    </div>
    <div class="p-field-checkbox">
      <Checkbox
        id="isNotPublic"
        v-model="localEvent.isNotPublic"
        name="isNotPublic"
        value="public"
        :binary="true"
      />
      <label for="isNotPublic">Nicht-öffentlich</label>
    </div>

    <div class="control-buttons">
      <router-link to="/events">
        <Button
          class="p-button-text"
          label="Abbrechen"
        />
      </router-link>
      <Button
        label="Ort auswählen"
        @click="saveAndProceed"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'

import { ApiClient } from '@/api'
import { CampaignDto } from '@/api/model/CampaignDto'
import { eventTypeOptions } from '@/api/model/EventTypes'
import EditEventMixin from '@/views/edit-event/EditEventMixin'
import { EventDto } from '@/api/model/EventDto'

const apiClient = new ApiClient()

export default defineComponent({
  name: 'EditEventDetails',
  components: {
    InputText,
    Dropdown,
    Calendar,
    Checkbox,
    Button,
    InputNumber,
    MultiSelect
  },
  mixins: [EditEventMixin],
  data() {
    return {
      campaigns: [] as CampaignDto[],
      metrics: [
        {name: 'Geklopfte Türen', value: 'Geklopfte Türen'},
        {name: 'Geöffnete Türen', value: 'Geöffnete Türen'},
        {name: 'Gute Gespräche', value: 'Gute Gespräche'},
        {name: 'Zustimmung', value: 'Zustimmung'},
        {name: 'Unterschriften', value: 'Unterschriften'}
      ],
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
        if (this.localEvent.endDate) {
          return new Date(this.localEvent.endDate)
        } else {
          return undefined
        }
      },
      set(value: Date) {
        this.localEvent.endDate = value.toISOString()
      }
    },
    startDate: {
      get(): Date | undefined {
        if (this.localEvent.startDate) {
          return new Date(this.localEvent.startDate)
        } else {
          return undefined
        }
      },
      set(value: Date) {
        this.localEvent.startDate = value.toISOString()
      }
    }
  },
  created() {
    this.getCampaigns()
  },
  methods: {
    async getCampaigns() {
      const response = await apiClient.campaign.list()
      this.campaigns = response.payload.data
    },
    async saveAndProceed() {
      let newEvent
      if (!this.event.id) {
        newEvent = this.localEvent = (await apiClient.events.create(this.event)).payload.data
      } else {
        newEvent = this.localEvent = (await apiClient.events.update(this.event!.id!.toString(), this.event as EventDto)).payload.data
      }
      this.$router.push({
        name: 'edit-event-location',
        params: {
          id: newEvent.id.toString()
        }
      })
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
