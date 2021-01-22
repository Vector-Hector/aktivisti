<template>
  <div class="container">
    <h1 v-if="$route.params.id">
      Kampagne editieren
    </h1>
    <h1 v-else>
      Neue Kampagne hinzufügen
    </h1>
    <div class="p-fluid">
      <div class="p-field p-grid">
        <label
          for="campaignName"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Name der Kampagne</label>
        <div class="p-col-12 p-md-9">
          <IonItem>
            <IonInput v-model="campaign.title" />
          </IonItem>
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="startDate"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Start</label>
        <div class="p-col-12 p-md-9">
          <IonDatetime
            v-model="campaign.startDate"
            display-format="DD.MM.YY"
            placeholder="Wähle ein Startdatum aus"
          />
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="startTime"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Ende</label>
        <div class="p-col-12 p-md-9">
          <IonDatetime
            v-model="campaign.endDate"
            display-format="DD.MM.YY"
            placeholder="Wähle ein Enddatum aus"
          />
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="campaign"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Typ</label>
        <div class="p-col-12 p-md-9">
          <IonSelect
            v-model="campaign.type"
            placeholder="Wähle einen Kampagnen-Typ aus"
          >
            <IonSelectOption
              v-for="campaignType in campaignTypes"
              :key="campaignType.id"
              value="f"
            >
              {{ campaignType.name }}
            </IonSelectOption>
          </IonSelect>
        </div>
      </div>

      <div class="p-field p-grid">
        <label
          for="campaign"
          class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
        >Bundes-, landes-, oder kreisweite Kampagne</label>
        <div class="p-col-12 p-md-9">
          <IonSelect
            v-model="campaign.organization"
            placeholder="Wähle ein Gebiet aus"
          >
            <IonSelectOption
              v-for="organizationType in organizationTypes"
              :key="organizationType.id"
              value="f"
            >
              {{ organizationType.name }}
            </IonSelectOption>
          </IonSelect>
        </div>
      </div>
    </div>

    <div class="control-buttons">
      <IonButton
        color="medium"
        @click="$router.push('/campaigns')"
      >
        Abbrechen
      </IonButton>
      <IonButton
        color="primary"
        @click="saveCampaign"
      >
        Kampagne hinzufügen
      </IonButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { CampaignDto } from '@/model/CampaignDto'
import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { CampaignOrganizationDto } from '@/api/model/CampaignOrganizationDto'
import { IonButton, IonInput, IonItem, IonDatetime, IonSelect, IonSelectOption } from '@ionic/vue'

export default defineComponent({
  name: 'NewCampaign',
  components: {
    IonButton,
    IonInput,
    IonItem,
    IonDatetime,
    IonSelect,
    IonSelectOption
  },
  data() {
    return {
      campaign: {} as CampaignDto,
      campaignTypes: [
        {name: 'Wahlkampf', id: 1},
        {name: 'Organizing', id: 2},
        {name: 'Petition', id: 3},
        {name: 'Datenerhebung', id: 4}
      ] as CampaignTypeDto[],
      organizationTypes: [
        {name: 'Bund', id: 1},
        {name: 'Land', id: 2},
        {name: 'Kreis', id: 3}
      ] as CampaignOrganizationDto[]
    }
  },
  created() {
    this.getCampaign()
  },
  methods: {
    getCampaign() {
      const id = this.$route.params.id
      fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`)
        .then((res) => res.json())
        .then((json) => {
          this.campaign = {...this.campaign, ...json}
        })
        .catch(/* handle errors*/)
    },
    saveCampaign() {
      const id = this.$route.params.id
      if (id) {
        fetch(`${process.env.VUE_APP_BASE_URL}/api/campaigns/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.campaign)
        })
          .then((data) => {
            console.log('Success:', data)
            this.$router.push('/campaigns')
          })
          .catch((error) => {
            console.error('Error:', error)
          })
      } else {
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
