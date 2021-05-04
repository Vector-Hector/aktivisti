<template>
  <IonContent>
    <div class="container">
      <Form
        v-slot="{ errors }"
        @submit="saveLead()"
      >
        <IonItem :class="{ 'select-item-has-error': !!errors.gender }">
          <IonLabel>
            Geschlecht
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="lead.gender"
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
            v-model="lead.last_name"
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
            v-model="lead.first_name"
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
            v-model="lead.email"
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
            v-model="lead.phone_number"
            :rules="isRequired"
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
            v-model="lead.plz"
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
            v-model="lead.city"
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
          <IonCheckbox
            id="isMember"
            slot="start"
            v-model="lead.is_party_member"
          />
        </IonItem>

        <IonItem lines="none">
          <IonLabel>
            Ich möchte DIE LINKE Mitglied werden
          </IonLabel>
          <IonCheckbox
            id="wantToBecomeMember"
            slot="start"
            v-model="lead.want_to_become_member"
          />
        </IonItem>

        <IonItem
          lines="none"
          :class="{ 'item-has-error': !!errors.privacy_opt_in }"
        >
          <IonLabel>
            Ich stimme der Datenschutzerklärung zu
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="lead.privacy_opt_in"
            :rules="isRequired"
            name="privacy_opt_in"
          >
            <IonCheckbox
              id="privacyOptIn"
              slot="start"
              v-bind="field"
            />
          </Field>
        </IonItem>
        <IonItem
          class="error-wrapper"
          lines="none"
        >
          <ErrorMessage
            name="privacy_opt_in"
            class="error"
          />
        </IonItem>

        <div class="control-buttons">
          <IonButton
            color="primary"
            type="submit"
          >
            Abschicken
          </IonButton>
        </div>
      </Form>
    </div>
  </IonContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { LeadDto } from '@/api/model/LeadDto'
import { IonButton, IonCheckbox, IonContent, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/vue'
import { Field, Form, ErrorMessage } from 'vee-validate'

export default defineComponent({
  name: 'CreateLead',
  components: {
    IonInput,
    IonSelectOption,
    IonSelect,
    IonCheckbox,
    IonButton,
    IonContent,
    IonLabel,
    IonItem,
    Field,
    Form,
    ErrorMessage,
  },
  props: {
    eventAreaId: {
      type: Number as PropType<number | undefined>,
      required: false,
      default: undefined
    }
  },
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
  methods: {
    async saveLead() {
      // TODO: Error handling
      await this.$apiClient.leads.create(
        {
          ...this.lead,
          event_area: this.eventAreaId
        })
      // TODO: maybe add an explicit back route
      this.$router.go(-1)
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

</style>
