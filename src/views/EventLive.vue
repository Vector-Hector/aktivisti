<template>
  <div
    v-if="event !== null"
    class="container"
  >
    <h2>{{ event.title }}</h2>
    <div class="p-grid">
      <span class="campaign p-col">{{ event.campaign.title }}</span>
    </div>

    <Map
      v-if="event.location"
      :center="event.location"
      :zoom="16"
      map-style="mapbox://styles/mapbox/streets-v11"
      class="map"
    >
      <Marker
        :key="event.id"
        :location="event.location"
      />
    </Map>

    <div class="p-fluid">
      <div class="p-field p-grid">
        <label
          for="visitedAddresses"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Besuchte Adressen:</label>
        <div class="p-col-12 p-md-9">
          <MultiSelect
            v-model="eventData.visitedAddresses"
            :options="visitedAddresses"
            option-label="name"
            placeholder="Besuchte Adressen"
            display="chip"
          />
        </div>
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="knockedDoors"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Geklopfte Türen:</label>
      <div class="p-col-12 p-md-9">
        <InputNumber
          id="knockedDoors"
          v-model="eventData.knockedDoors"
          show-buttons
          mode="decimal"
          :min="0"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="openedDoors"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Geöffnete Türen:</label>
      <div class="p-col-12 p-md-9">
        <InputNumber
          id="openedDoors"
          v-model="eventData.openedDoors"
          show-buttons
          mode="decimal"
          :min="0"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="goodChats"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Gute Gespräche:</label>
      <div class="p-col-12 p-md-9">
        <InputNumber
          id="goodChats"
          v-model="eventData.goodChats"
          show-buttons
          mode="decimal"
          :min="0"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="consent"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Zustimmung:</label>
      <div class="p-col-12 p-md-9">
        <InputNumber
          id="goodChats"
          v-model="eventData.consent"
          show-buttons
          mode="decimal"
          :min="0"
          @input="handleInput"
        />
      </div>
    </div>

    <ProgressBar
      :value="progress"
      :show-value="false"
    />

    <div class="p-grid p-jc-end button-group">
      <router-link
        to="/events"
        class="event-button no-button-decoration"
      >
        <IonButton>Default</IonButton>
        <ion-button color="primary">
          Primary
        </ion-button>

        <ion-button color="secondary">Secondary</ion-button>


        <Button class="gray-button">
          Beenden
        </Button>
      </router-link>
      <router-link
        :to="{ name: 'create-lead', query: {event: event.id}}"
        class="no-button-decoration"
      >
        <Button>Kontakt registrieren</Button>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import { D2DMetricsDto } from '@/api/model/D2DMetricsDto'
import Button from 'primevue/components/button/Button'
import { ApiClient } from '@/api'

import Map from '@/lib/mapbox/Map.vue'
import Marker from '@/lib/mapbox/Marker.vue'

import InputNumber from 'primevue/inputnumber'
import ProgressBar from 'primevue/progressbar'
import MultiSelect from 'primevue/multiselect'

import { IonButton } from '@ionic/vue';


interface EventData {
  knockedDoors: number
  openedDoors: number
  goodChats: number
  consent: number
}

interface EventDetailData {
  event: EventDto | null,
  metrics: D2DMetricsDto[] | null,
  eventData: EventData,
  visitedAddresses: object[],
  progress: number,
}

const apiClient = new ApiClient()

export default defineComponent({
  name: 'EventLive',
  components: {
    Button,
    Map,
    Marker,
    InputNumber,
    ProgressBar,
    MultiSelect,
    IonButton
  },
  data(): EventDetailData {
    return {
      event: null,
      metrics: [
        {name: 'Geklopfte Türen', value: 'Geklopfte Türen'},
        {name: 'Geöffnete Türen', value: 'Geöffnete Türen'},
        {name: 'Gute Gespräche', value: 'Gute Gespräche'},
        {name: 'Zustimmung', value: 'Zustimmung'},
        {name: 'Unterschriften', value: 'Unterschriften'}
      ],
      eventData: {
        knockedDoors: 0,
        openedDoors: 0,
        goodChats: 0,
        consent: 0
      },
      visitedAddresses: [
        {name: 'Hauptstr.', value: 'Hauptstr.'},
        {name: 'Bahnhofstr.', value: 'Bahnhofstr.'},
        {name: 'Mittelstr.', value: 'Mittelstr.'},
        {name: 'Seestr.', value: 'Seestr.'},
        {name: 'Berliner Str.', value: 'Berliner Str.'}
      ],
      progress: 0
    }
  },
  created() {
    this.getEvent()
  },
  methods: {
    async getEvent() {
      const id = parseInt(this.$route.params.id as string)
      this.event = (await apiClient.events.get(id)).data
    },
    handleInput() {
      // TODO get taget data
      this.progress = this.eventData.consent * 100 / 20
    }
  }
})

</script>

<style lang="scss" scoped>
@import "~@/scss/_globals.scss";

label {
  text-align: left;
}

Button {
  margin: 10px;
  background: $red;
  border: 1px solid $red;
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
</style>
