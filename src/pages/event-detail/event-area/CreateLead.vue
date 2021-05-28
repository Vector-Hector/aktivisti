<template>
  <div class="qr-link">
    <a
      @click="openQRCode"
    >
      <span class="qr-link-caption">QR-Link zu diesem Formular</span>
      <img
        class="qr-link-image"
        src="../../../assets/img/create-lead-qr.png"
        alt="QR Code zum Linksaktiv-Formular"
      >
    </a>
  </div>
  <QForm
    v-slot="{ errors, isSubmitting }"
    ref="form"
    @submit="saveLead"
  >
    <QSelect
      label="Geschlecht"
      v-model="lead.gender"
      :rules="[$validationRules.isRequired]"
      :options="genders"
      option-value="value"
      option-label="label"
      :error-message="errors.gender?.[0]"
      :error="!!errors.gender?.length"
    />
    <QInput
      label="Nachname"
      v-model="lead.last_name"
      :rules="[$validationRules.isRequired]"
      :error-message="errors.last_name?.[0]"
      :error="!!errors.last_name?.length"
    />
    <QInput
      label="Vorname"
      v-model="lead.first_name"
      :rules="[$validationRules.isRequired]"
      :error-message="errors.first_name?.[0]"
      :error="!!errors.first_name?.length"
    />
    <QInput
      label="E-Mail"
      v-model="lead.email"
      :rules="[$validationRules.isRequired, $validationRules.email]"
      :error-message="errors.email?.[0]"
      :error="!!errors.email?.length"
    />
    <QInput
      label="Telefonnummer"
      v-model="lead.phone_number"
      :rules="[$validationRules.isRequired]"
      :error-message="errors.phone_number?.[0]"
      :error="!!errors.phone_number?.length"
    />
    <QInput
      label="Postleitzahl"
      v-model="lead.plz"
      :minlength="5"
      :maxlength="5"
      :rules="[$validationRules.isRequired]"
      :error-message="errors.plz?.[0]"
      :error="!!errors.plz?.length"
    />

    <QInput
      label="Stadt"
      v-model="lead.city"
      :rules="[$validationRules.isRequired]"
      :error-message="errors.city?.[0]"
      :error="!!errors.city?.length"
    />

    <QCheckbox
      label="Ich bin DIE LINKE Mitglied"
      v-model="lead.is_party_member"
    />
    <QCheckbox
      label="Ich möchte DIE LINKE Mitglied werden"
      v-model="lead.want_to_become_member"
    />
    <div class="control-buttons">
      <FormError :error="errors.non_field_error" />
      <QBtn
        color="primary"
        type="submit"
        :disabled="isSubmitting"
      >
        Abschicken
      </QBtn>
    </div>
  </QForm>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LeadDto } from 'src/api/model/LeadDto'
import {
  modalController
} from '@ionic/vue'
import CreateLeadQR from 'src/components/modals/CreateLeadQR.vue'
import EventAreaMixin from 'src/pages/event-detail/event-area/EventAreaMixin'
import { QCheckbox, QForm, QInput, QSelect } from 'quasar'
import FormError from 'components/FormError.vue'

export default defineComponent({
  name: 'CreateLead',
  components: {
    FormError,
    QForm,
    QInput,
    QSelect,
    QCheckbox
  },
  mixins: [EventAreaMixin],
  data() {
    return {
      confirmOpen: false,
      lead: {} as Partial<LeadDto>,
      isSubmitting: false,
      errors: {},
      genders: [
        {
          value: 'm',
          label: 'männlich'
        },
        {
          value: 'w',
          label: 'weiblich'
        },
        {
          value: 'd',
          label: 'divers'
        }
      ]
    }
  },
  methods: {
    async saveLead() {
      this.isSubmitting = true
      try {
        await this.$apiClient.leads.create(
          {
            ...this.lead,
            event_area: this.eventArea.id,
            // The form will register the lead on the behalf of someone else - therefor a double opt in is necessary
            // The first opt in here is implicit by offering the data in a person to person talk at the door
            privacy_opt_in: true
          })
        // TODO: maybe add an explicit back route
        this.$router.go(-1)
      } catch (error) {
        if (error.response.status === 400) {
          this.errors = error.response.data
        } else {
          this.errors = {'non_field_error': ['Ein unerwarteter Fehler ist aufgetreten']}
        }
      }
    },
    isRequired(value: string) {
      if (!value) {
        return 'Bitte fülle dieses Feld aus'
      }
      return true
    },
    async openQRCode() {
      const modal = await modalController.create({
        component: CreateLeadQR
      })
      await modal.present()
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_variables.scss";

.qr-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0.7rem 0;
}

.qr-link-caption {
  color: $red;
  opacity: 0.7;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.qr-link-image {
  width: 1rem;
  height: 1rem;
}


</style>
