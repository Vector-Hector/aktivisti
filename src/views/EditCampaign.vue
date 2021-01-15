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
          v-model="campaign.title"
          type="text"
        />
      </div>
    </div>

    <div class="p-field p-grid">
      <label
        for="startDate"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Start</label>
      <div class="p-col-12 p-md-9">
        <Calendar
          v-model="campaign.startDate"
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
          v-model="campaign.endDate"
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
          option-label="title"
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
          v-model="campaign.type"
          :options="organizationTypes"
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
import { CampaignDto } from "@/model/CampaignDto";

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
      campaign: {} as CampaignDto,
      campaignTypes: [
        { title: "Wahlkampf", id: 0 },
        { title: "Organizing", id: 1 },
        { title: "Petition", id: 2 },
        { title: "Datenerhebung", id: 3 },
      ],
      organizationTypes: [
        { name: "Bund", id: "1" },
        { name: "Land", id: "2" },
        { name: "Kreis", id: "3" },
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
          this.campaign = { ...this.campaign, ...json };
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