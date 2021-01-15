<template>
  <h1>Event editieren</h1>
  <div class="p-fluid">
    <div class="p-field p-grid">
      <label
        for="eventName"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Name des Events</label>
      <div class="p-col-12 p-md-9">
        <InputText
          id="eventName"
          v-model="event.name"
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
          v-model="event.selectedCampaign"
          :options="campaigns"
          option-label="name"
          placeholder="Wähle eine Kampagne aus"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="startTime"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Zeit</label>
      <div class="p-col-12 p-md-9">
        <Calendar
          v-model="event.startTime"
          date-format="dd.mm.yy"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="eventMeetingPoint"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Treffpunkt
      </label>
      <div class="p-col-12 p-md-9">
        <Button
          v-if="!event.location"
          class="modal-button"
          label="Ort auf Karte auswählen"
          icon="pi pi-external-link"
          @click="openModal"
        />
        <Button
          v-else
          class="modal-button"
          label="Ort auf Karte ändern"
          icon="pi pi-external-link"
          @click="openModal"
        />
      </div>
    </div>

    <Dialog
      v-model:visible="displayModal"
      header="Wähle einen Treffpunkt aus"
      :style="{ width: '75vw' }"
      :modal="true"
    >
      <div class="map">
        <LMap
          v-model="zoom"
          :zoom="zoom"
          :center="center"
        >
          <LTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LMarker
            v-model:latLng="event.location"
            draggable
          />
        </LMap>
      </div>

      <template #footer>
        <Button
          label="Abbrechen"
          icon="pi pi-times"
          class="p-button-text"
          @click="closeModal"
        />
        <Button
          label="Übernehmen"
          icon="pi pi-check"
          autofocus
          @click="confirmLocation"
        />
      </template>
    </Dialog>

    <div class="p-field p-grid">
      <label
        for="eventParticipantsMax"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      ># Personen</label>
      <div class="p-col-12 p-md-9">
        <InputNumber
          id="eventParticipantsMax"
          v-model="event.maxParticipants"
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
          v-model="event.info"
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
          v-model="event.selectedMetrics"
          :options="metrics"
          option-label="name"
          placeholder="Metriken auswählen"
          display="chip"
        />
      </div>
    </div>

    <div v-if="event.selectedMetrics && event.selectedMetrics.length > 0">
      <div
        v-for="metric in event.selectedMetrics"
        :key="metric.name"
      >
        <div class="p-field p-grid">
          <label
            for="eventGoals"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Zielvorgabe für {{ metric.name }} hinzufügen</label>
          <div class="p-col-12 p-md-9">
            <InputNumber
              v-model="event.targets[metric.name]"
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
          v-model="event.tasks"
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
          v-model="event.infoLink"
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
          v-model="event.contact"
          type="text"
        />
      </div>
    </div>
  </div>
  <div class="p-field-checkbox">
    <Checkbox
      id="isNotPublic"
      v-model="event.isNotPublic"
      name="isNotPublic"
      value="public"
      :binary="true"
    />
    <label for="isNotPublic">Nicht-öffentlich</label>
  </div>

  <div class="control-buttons">
    <Button
      class="p-button-text"
      label="Abbrechen"
      @click="$router.push('/events')"
    />
    <Button
      label="Speichern"
      @click="saveEvent"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import MultiSelect from "primevue/multiselect";

import Dialog from "primevue/dialog";
// @ts-ignore
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

export default defineComponent({
  name: "NewEvent",
  components: {
    InputText,
    Dropdown,
    Calendar,
    Checkbox,
    Button,
    InputNumber,
    MultiSelect,
    Dialog,
    LMap,
    LTileLayer,
    LMarker,
  },
  data() {
    return {
      event: {
        selectedMetrics: [],
        targets: {},
        selectedCampaign: {},
      },
      campaigns: [],
      metrics: [
        { name: "Geklopfte Türen", value: "Geklopfte Türen" },
        { name: "Geöffnete Türen", value: "Geöffnete Türen" },
        { name: "Gute Gespräche", value: "Gute Gespräche" },
        { name: "Zustimmung", value: "Zustimmung" },
        { name: "Unterschriften", value: "Unterschriften" },
      ],
      displayModal: false,
      zoom: 6,
      iconWidth: 25,
      iconHeight: 40,
      center: [51.5, 10],
    };
  },
  created() {
    this.getEvent();
    this.getCampaigns();
  },
  methods: {
    getEvent() {
      const id = this.$route.params.id;
      fetch(`${process.env.VUE_APP_BASE_URL}/api/events/${id}`)
        .then((res) => res.json())
        .then((json) => {
          this.event = { ...this.event, ...json.event };
        })
        .catch(/* handle errors*/);
    },
    saveEvent() {
      const id = this.$route.params.id;
      fetch(`${process.env.VUE_APP_BASE_URL}/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.event),
      })
        .then((data) => {
          console.log("Success:", data)
          this.$router.push("/events")
        })
        .catch((error) => {
          console.error("Error:", error)
        });

    },
    getCampaigns() {
      fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`)
        .then((res) => res.json())
        .then((json) => {
          this.campaigns = json.campaigns;
        })
        .catch(/* handle errors*/);
    },
    openModal() {
      this.displayModal = true;
    },
    closeModal() {
      this.displayModal = false;
    },
    confirmLocation() {
      this.displayModal = false;
    },
  },
});
</script>

<style lang="scss" scoped>
label {
  text-align: left;
}

Button {
  margin: 10px;
}

.map {
  height: 45vh;
  width: auto;
}

.modal-button {
  width: unset !important;
  display: flex;
  margin: unset;
}
</style>