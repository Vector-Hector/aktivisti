<template>
  <h1>Kampagne editieren</h1>
  <div class="p-fluid">
    <div class="p-field p-grid">
      <label
        for="campaignName"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Names der Kampagne</label>
      <div class="p-col-12 p-md-9">
        <InputText
          id="campaignName"
          v-model="campaign.name"
          type="text"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="startTime"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Start</label>
      <div class="p-col-12 p-md-9">
        <Calendar
          v-model="campaign.start"
          date-format="dd.mm.yy"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="startTime"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Ende</label>
      <div class="p-col-12 p-md-9">
        <Calendar
          v-model="campaign.end"
          date-format="dd.mm.yy"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="campaign"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Typ</label>
      <div class="p-col-12 p-md-9">
        <Dropdown
          v-model="campaign.type"
          :options="campaignTypes"
          option-label="name"
          placeholder="Wähle einen Kampagnen-Typ aus"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="campaign"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Bundes-, landes-, oder kreisweite Kampagne</label>
      <div class="p-col-12 p-md-9">
        <Dropdown
          v-model="campaign.organisation"
          :options="organisationType"
          option-label="name"
          placeholder="Wähle ein Gebiet aus"
        />
      </div>
    </div>
  </div>

  <div class="control-buttons">
    <Button
      class="p-button-text"
      label="Abbrechen"
      @click="$router.push('/campaigns')"
    />
    <Button
      label="Speichern"
      @click="saveCampaign"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

export default defineComponent({
  name: "NewCampaign",
  components: {
    InputText,
    Dropdown,
    Calendar,
    Button,
  },
  data() {
    return {
      campaign: {},
      campaignTypes: [
        { name: "Wahlkampf", id: 0 },
        { name: "Organizing", id: 1 },
        { name: "Petition", id: 2 },
        { name: "Datenerhebung", id: 3 },
      ],
      organisationType: [
        { name: "Bund", code: "Bund" },
        { name: "Land", code: "Land" },
        { name: "Kreis", code: "Kreis" },
      ],
    };
  },
  created() {
    this.getCampaign();
  },
  methods: {
    getCampaign() {
      const id = this.$route.params.id;
      fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`)
        .then((res) => res.json())
        .then((json) => {
          this.campaign = { ...this.campaign, ...json.campaign };
        })
        .catch(/* handle errors*/);
    },
    saveCampaign() {
      const id = this.$route.params.id;
      fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.campaign),
      })
        .then((data) => {
          console.log("Success:", data);
          this.$router.push("/campaigns");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
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
</style>