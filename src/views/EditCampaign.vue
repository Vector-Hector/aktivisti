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
        <div
          v-if="campaign.type"
          class="p-col-12 p-md-9"
        >
          <IonSelect
            v-model="campaign.type.name"
            placeholder="Wähle einen Kampagnen-Typ aus"
            vg-if="campaign.type"
          >
            <IonSelectOption
              v-for="campaignType in campaignTypes"
              :key="campaignType.id"
              :value="campaignType.name"
            >
              {{ campaignType.name }}
            </IonSelectOption>
          </IonSelect>
        </div>
        <div
          v-else
          class="p-col-12 p-md-9"
        >
          <IonSelect
            v-model="campaign.type"
            placeholder="Wähle einen Kampagnen-Typ aus"
            vg-if="campaign.type"
          >
            <IonSelectOption
              v-for="campaignType in campaignTypes"
              :key="campaignType.id"
              :value="campaignType.id"
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
        <div
          v-if="campaign.organization"
          class="p-col-12 p-md-9"
        >
          <IonSelect
            v-model="campaign.organization.name"
            vg-if="campaign.organization"
            placeholder="Wähle ein Gebiet aus"
          >
            <IonSelectOption
              v-for="organizationType in organizationTypes"
              :key="organizationType.id"
              :value="organizationType.name"
            >
              {{ organizationType.name }}
            </IonSelectOption>
          </IonSelect>
        </div>
        <div
          v-else
          class="p-col-12 p-md-9"
        >
          <IonSelect
            v-model="campaign.organization"
            vg-if="campaign.organization"
            placeholder="Wähle ein Gebiet aus"
          >
            <IonSelectOption
              v-for="organizationType in organizationTypes"
              :key="organizationType.id"
              :value="organizationType.id"
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
        Speichern
      </IonButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { OrganizationTypeDto } from '@/api/model/OrganizationTypeDto'
import { IonButton, IonInput, IonItem, IonDatetime, IonSelect, IonSelectOption } from '@ionic/vue'
import { CampaignDto } from '@/api/model/CampaignDto'
import { ApiClient } from '@/api'

const apiClient = new ApiClient()

export default defineComponent({
  name: 'EditCampaign',
  components: {
    IonButton,
    IonInput,
    IonItem,
    IonDatetime,
    IonSelect,
    IonSelectOption
  },
  props: {
    id: {
      type: String as PropType<string | null>,
      required: false,
      default: null
    }
  },
  data() {
    return {
      campaign: {} as CampaignDto,
      campaignTypes: [] as CampaignTypeDto[],
      organizationTypes: [] as OrganizationTypeDto[]
    }
  },
  created() {
    this.getCampaign()
    this.getOrganizationTypes()
    this.getCampaignTypes()
  },
  methods: {
    async getOrganizationTypes() {
      const response = await apiClient.organizationTypes.list()
      this.organizationTypes = response.payload.data
    },
    async getCampaignTypes() {
      const response = await apiClient.campaignTypes.list()
      this.campaignTypes = response.payload.data
    },
    async getCampaign() {
      if (this.id) {
        const response = await apiClient.campaign.get(this.id)
        this.campaign = response.payload.data
      }
    },
    async saveCampaign() {
      if (this.id !== null) {
        const response = await apiClient.campaign.update(this.id, this.campaign)
        this.campaign = response.payload.data
        this.$router.push('/campaigns')
      } else {
        const response = await apiClient.campaign.create(this.campaign)
        this.campaign = response.payload.data
        this.$router.push('/campaigns')
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
