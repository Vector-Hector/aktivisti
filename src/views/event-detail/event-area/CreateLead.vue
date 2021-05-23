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
  <Form
    v-slot="{ errors, isSubmitting }"
    ref="form"
    @submit="saveLead"
  >
    <IonItem :class="{ 'select-item-has-error': !!errors.gender }">
      <IonLabel>
        Geschlecht
      </IonLabel>
      <Field
        v-slot="{ field }"
        :rules="isRequired"
        name="gender"
      >
        <IonSelect
          id="gender"
          :value="field.value"
          type="select"
          @ionChange="field.onChange.forEach((fn) => fn($event))"
        >
          <IonSelectOption
            v-for="gender in genders"
            :key="gender.value"
            :value="gender.value"
          >
            {{ gender.label }}
          </IonSelectOption>
        </IonSelect>
      </Field>
    </IonItem>
    <IonItem
      class="error-wrapper"
      lines="none"
    >
      <ErrorMessage
        name="gender"
        class="error"
      />
    </IonItem>

    <IonItem :class="{ 'item-has-error': !!errors.last_name }">
      <IonLabel position="floating">
        Nachname
      </IonLabel>
      <Field
        v-slot="{ field }"
        :rules="isRequired"
        name="last_name"
      >
        <IonInput
          id="lastName"
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
        name="last_name"
        class="error"
      />
    </IonItem>

    <IonItem :class="{ 'item-has-error': !!errors.first_name }">
      <IonLabel position="floating">
        Vorname
      </IonLabel>
      <Field
        v-slot="{ field }"
        :rules="isRequired"
        name="first_name"
      >
        <IonInput
          id="firstName"
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
        name="first_name"
        class="error"
      />
    </IonItem>

    <IonItem :class="{ 'item-has-error': !!errors.email }">
      <IonLabel position="floating">
        E-Mail
      </IonLabel>
      <Field
        v-slot="{ field }"
        :rules="isRequired"
        name="email"
      >
        <IonInput
          id="email"
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
        name="email"
        class="error"
      />
    </IonItem>

    <IonItem :class="{ 'item-has-error': !!errors.phone_number }">
      <IonLabel position="floating">
        Telefonnummer
      </IonLabel>
      <Field
        v-slot="{ field }"
        name="phone_number"
      >
        <IonInput
          id="phone"
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
        name="phone_number"
        class="error"
      />
    </IonItem>

    <IonItem :class="{ 'item-has-error': !!errors.plz }">
      <IonLabel position="floating">
        Postleitzahl
      </IonLabel>
      <Field
        v-slot="{ field }"
        :rules="isRequired"
        name="plz"
      >
        <IonInput
          id="plz"
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
        name="plz"
        class="error"
      />
    </IonItem>

    <IonItem :class="{ 'item-has-error': !!errors.city }">
      <IonLabel position="floating">
        Stadt
      </IonLabel>
      <Field
        v-slot="{ field }"
        :rules="isRequired"
        name="city"
      >
        <IonInput
          id="city"
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
        name="city"
        class="error"
      />
    </IonItem>

    <IonItem lines="none">
      <IonLabel>
        Ich bin DIE LINKE Mitglied
      </IonLabel>
      <Field
        v-slot="{ field }"
        name="is_party_member"
      >
        <IonCheckbox
          id="isMember"
          slot="start"
          v-bind="field"
        />
      </Field>
    </IonItem>

    <IonItem lines="none">
      <IonLabel
        for="wantsToBecomeMember"
      >
        Ich möchte DIE LINKE Mitglied werden
      </IonLabel>
      <Field
        v-slot="{ field }"
        name="wants_to_become_member"
      >
        <IonCheckbox
          id="wantsToBecomeMember"
          slot="start"
          v-bind="field"
        />
      </Field>
    </IonItem>
    <div class="control-buttons">
      <IonButton
        color="primary"
        type="submit"
        :disabled="isSubmitting"
      >
        Abschicken
      </IonButton>
    </div>
  </Form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LeadDto } from '@/api/model/LeadDto'
import {
  IonButton,
  IonCheckbox,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  modalController
} from '@ionic/vue'
import { Field, Form, ErrorMessage, FormActions } from 'vee-validate'
import CreateLeadQR from '@/components/modals/CreateLeadQR.vue'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'

export default defineComponent({
  name: 'CreateLead',
  components: {
    IonInput,
    IonSelectOption,
    IonSelect,
    IonCheckbox,
    IonButton,
    IonLabel,
    IonItem,
    Field,
    Form,
    ErrorMessage
  },
  mixins: [EventAreaMixin],
  data() {
    return {
      confirmOpen: false,
      lead: {} as Partial<LeadDto>,
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
  watch: {
    $route() {
      (this.$refs.form as typeof Form)?.resetForm()
    }
  },
  methods: {
    async saveLead(data: Partial<LeadDto>, actions: FormActions<any>) {
      this.lead = data
      try {
        await this.$apiClient.leads.create(
          {
            ...data,
            event_area: this.eventArea.id,
            // The form will register the lead on the behalf of someone else - therefor a double opt in is necessary
            // The first opt in here is implicit by offering the data in a person to person talk at the door
            privacy_opt_in: true
          })
        actions.resetForm()
        // TODO: maybe add an explicit back route
        this.$router.go(-1)
      } catch (e) {
        actions.setErrors(e.data)
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
@import "~@/scss/_variables.scss";

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
