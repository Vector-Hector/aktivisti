<template>
  <h1>Neue Kampagne hinzufügen</h1>

  <div class="p-fluid">
    <div class="p-field p-grid">
      <label
        for="campaignName"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Name der Kampagne</label>
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
        for="startTime"
        class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
      >Start</label>
      <div class="p-col-12 p-md-9">
        <Calendar
          v-model="campaign.startTime"
          date-format="dd.mm.yy"
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
          v-model="campaign.organization"
          :options="organizationType"
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
import { defineComponent } from 'vue'

import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import { CampaignDto, CampaignTypeDto, OrganizationTypeDto } from '@/model/CampaignDto'

interface NewCampaignData {
  campaign: Partial<CampaignDto>,
  campaignTypes: CampaignTypeDto[],
  organizationType: OrganizationTypeDto[]
}

export default defineComponent({
  name: 'NewCampaign',
  components: {
    InputText,
    Dropdown,
    Calendar,
    Button
  },
  data(): NewCampaignData {
    return {
      campaign: {},
      campaignTypes: [
        {name: 'Wahlkampf', id: '1'},
        {name: 'Organizing', id: '2'},
        {name: 'Petition', id: '3'},
        {name: 'Datenerhebung', id: '4'}
      ],
      organizationType: [
        { name: "Bund", code: "Bund" },
        { name: "Land", code: "Land" },
        { name: "Kreis", code: "Kreis" },
      ],
    }
  },
  methods: {
    saveCampaign() {
      fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.campaign)
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data)
          this.$router.push('/campaigns')
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
  }
})
</script>

<style lang="scss" scoped>
label {
  text-align: left;
}

Button {
  margin: 10px;
}
</style>
