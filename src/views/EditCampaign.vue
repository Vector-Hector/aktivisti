<template>
  <div class="container">
    <h1 v-if="$route.params.id">
      Kampagne editieren
    </h1>
    <h1 v-else>
      Neue Kampagne hinzufügen
    </h1>
    <Form
      v-slot="{ errors }"
      @submit="saveCampaign()"
    >
      <div class="p-fluid">
        <div class="p-field p-grid">
          <label
            for="campaignName"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Name der Kampagne</label>
          <div class="p-col-12 p-md-9">
            <IonItem :class="{ 'item-has-error': !!errors.name }">
              <Field
                v-slot="{ field }"
                v-model="campaign.name"
                :rules="isRequired"
                name="name"
              >
                <IonInput
                  v-bind="field"
                  type="text"
                />
              </Field>
            </IonItem>
            <IonItem
              class="error-wrapper"
              lines="none"
            >
              <ErrorMessage
                name="name"
                class="error"
              />
            </IonItem>
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="startDate"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Start</label>
          <div class="p-col-12 p-md-9">
            <IonItem :class="{ 'item-has-error': !!errors.start_date }">
              <Field
                v-slot="{ field }"
                v-model="campaign.start_date"
                name="start_date"
                value="value"
                :rules="isRequired"
              >
                <IonDatetime
                  display-format="DD.MM.YY"
                  placeholder="Wähle ein Startdatum aus"
                  :value="field.value"
                  @ionChange="field.onChange.forEach((fn) => fn($event))"
                />
              </Field>
            </IonItem>
            <IonItem
              class="error-wrapper"
              lines="none"
            >
              <ErrorMessage
                name="start_date"
                class="error"
              />
            </IonItem>
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="startTime"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Ende</label>
          <div class="p-col-12 p-md-9">
            <IonItem :class="{ 'item-has-error': !!errors.end_date }">
              <Field
                v-slot="{ field }"
                v-model="campaign.end_date"
                name="end_date"
                value="value"
                :rules="isRequired"
              >
                <IonDatetime
                  display-format="DD.MM.YY"
                  placeholder="Wähle ein Enddatum aus"
                  :value="field.value"
                  @ionChange="field.onChange.forEach((fn) => fn($event))"
                />
              </Field>
            </IonItem>
            <IonItem
              class="error-wrapper"
              lines="none"
            >
              <ErrorMessage
                name="end_date"
                class="error"
              />
            </IonItem>
          </div>
        </div>

        <div class="p-field p-grid">
          <label
            for="campaign"
            class="p-col-12 p-mb-2 p-md-3 p-mb-md-0"
          >Typ</label>
          <div class="p-col-12 p-md-9">
            <IonItem :class="{ 'item-has-error': !!errors.campaign_type }">
              <Field
                v-slot="{ field }"
                v-model="campaign.campaign_type"
                name="campaign_type"
                value="value"
                :rules="isRequired"
              >
                <IonSelect
                  placeholder="Wähle einen Kampagnen-Typ aus"
                  :value="field.value"
                  @ionChange="field.onChange.forEach((fn) => fn($event))"
                >
                  <IonSelectOption
                    v-for="campaignType in campaignTypes"
                    :key="campaignType.id"
                    :value="campaignType.id"
                  >
                    {{ campaignType.name }}
                  </IonSelectOption>
                </IonSelect>
              </Field>
            </IonItem>
            <IonItem
              class="error-wrapper"
              lines="none"
            >
              <ErrorMessage
                name="campaign_type"
                class="error"
              />
            </IonItem>
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
          type="submit"
        >
          Speichern
        </IonButton>
      </div>
    </Form>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { CampaignTypeDto } from '@/api/model/CampaignTypeDto'
import { OrganizationTypeDto } from '@/api/model/OrganizationTypeDto'
import { IonButton, IonInput, IonItem, IonDatetime, IonSelect, IonSelectOption } from '@ionic/vue'
import { CampaignDto } from '@/api/model/CampaignDto'
import { Field, Form, ErrorMessage } from 'vee-validate'

export default defineComponent({
  name: 'EditCampaign',
  components: {
    IonButton,
    IonInput,
    IonItem,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    Field,
    Form,
    ErrorMessage,
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
  async created() {
    await this.getCampaignTypes()
    this.getCampaign()
  },
  methods: {
    async getCampaignTypes() {
      const response = await this.$apiClient.campaignTypes.list()
      this.campaignTypes = response.payload.data
    },
    async getCampaign() {
      if (this.id) {
        const response = await this.$apiClient.campaigns.get(this.id)
        this.campaign = response.payload.data
      }
    },
    async saveCampaign() {
      if (this.id !== null) {
        const response = await this.$apiClient.campaigns.update(this.id, this.campaign)
        this.campaign = response.payload.data
        this.$router.push('/campaigns')
      } else {
        const response = await this.$apiClient.campaigns.create(this.campaign)
        this.campaign = response.payload.data
        this.$router.push('/campaigns')
      }
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

Button {
  margin: 10px;
}
</style>
