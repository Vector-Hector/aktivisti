<template>
  <IonContent>
    <div class="container">
      <Form
        v-slot="{ errors, isSubmitting }"
        @submit="register"
      >
        <IonItem :class="{ 'item-has-error': !!errors.email }">
          <IonLabel position="floating">
            E-Mail-Adresse
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="registrationData.email"
            :rules="{ email: true, required: true }"
            name="email"
          >
            <IonInput
              v-bind="field"
              type="email"
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
        <IonItem :class="{ 'item-has-error': !!errors.username }">
          <IonLabel position="floating">
            Benutzername
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="registrationData.username"
            :rules="{ required: true }"
            name="username"
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
            name="username"
            class="error"
          />
        </IonItem>

        <IonItem :class="{ 'item-has-error': !!errors.password }">
          <IonLabel position="floating">
            Passwort
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="registrationData.password"
            :rules="{ required: true }"
            name="password"
          >
            <IonInput
              v-bind="field"
              type="password"
            />
          </Field>
        </IonItem>
        <IonItem
          class="error-wrapper"
          lines="none"
        >
          <ErrorMessage
            name="password"
            class="error"
          />
        </IonItem>
        <IonItem :class="{ 'item-has-error': !!errors.plz }">
          <IonLabel position="floating">
            Postleitzahl
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="registrationData.plz"
            name="plz"
            :rules="{ required: true }"
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
            name="plz"
            class="error"
          />
        </IonItem>
        <IonItem :class="{ 'item-has-error': !!errors.first_name }">
          <IonLabel position="floating">
            Vorname
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="registrationData.first_name"
            name="first_name"
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
            name="first_name"
            class="error"
          />
        </IonItem>

        <IonItem :class="{ 'item-has-error': !!errors.last_name }">
          <IonLabel position="floating">
            Nachname
          </IonLabel>
          <Field
            v-slot="{ field }"
            v-model="registrationData.last_name"
            name="last_name"
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
            name="last_name"
            class="error"
          />
        </IonItem>

        <div class="privacy-disclaimer">
          <IonText>
            Als Nutzer:in der LINKEN App nimmst Du zur Kenntnis und stimmst zu, dass Du die per App erhaltenen und
            übermittelten Daten zu keinem anderen Zweck als der Organisation von Aktionen der Partei DIE LINKE nutzt,
            insbesondere diese weder speicherst, noch kopierst oder Dritten für andere Zwecke übermittelst. Du stimmst
            zu,
            dass Passwort stets vertraulich zu behandeln und jeden Verlust des Gerätes oder jede mögliche Offenbarung
            des
            Passwortes oder zweckwidrige Nutzung der App durch Dritte unverzüglich dem Bundesvorstand unter
            <a href="mailto:datenschutz@die-linke.app">datenschutz@die-linke.app</a> mitzuteilen.
            Du stimmst zu, jede Nachfrage Dritter zum Umfang der Datenverarbeitung der App an den Verantwortlichen beim
            Bundesvorstand der Partei weiterzuleiten und dem Betroffenen die Kontaktdaten bzw. den Link zu den
            <a
              href="https://www.die-linke.de/seitenfuss/datenschutz"
              target="_blank"
            >
              Datenschutzhinweisen
            </a>
            mitzuteilen.
          </IonText>
        </div>
        <IonItem
          class="error-wrapper"
          lines="none"
        >
          <ErrorMessage
            name="non-field-error"
            class="error"
          />
        </IonItem>
        <div class="control-buttons">
          <IonButton
            color="primary"
            type="submit"
            :disabled="isSubmitting"
          >
            Registrieren
          </IonButton>
        </div>
      </Form>

      <IonItemDivider />

      <div class="sign-up-link">
        Du bist bereits angemeldet?
        <router-link to="/login">
          Zum Login
        </router-link>
      </div>
    </div>
  </IonContent>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Field, Form, ErrorMessage } from 'vee-validate'

import {
  IonInput,
  IonLabel,
  IonItem,
  IonButton,
  IonItemDivider,
  IonContent,
  IonText,
  alertController
} from '@ionic/vue'
import { UserRegistrationDto } from 'src/api/model/UserRegistrationDto'

export default defineComponent({
  name: 'Register',
  components: {
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
    IonContent,
    IonItemDivider,
    Field,
    Form,
    ErrorMessage,
    IonText
  },
  data() {
    return {
      registrationData: {} as Partial<UserRegistrationDto>
    }
  },
  async created() {
    const betaAlert = await alertController.create({
      header: 'Geschlossene Beta',
      message: 'Schön, dass du dich für die LINKE Wahlkampf-App interessierst. Derzeit befinden wir uns in einer ' +
        'geschlossenen Beta-Phase. Registrierungen sind erst ab der nächsten Phase möglich. ' +
        'Um jetzt schon mitzumachen, muss eine Genoss*in dich einladen.',
      buttons: ['Okay']
    })
    await betaAlert.present()
  },
  methods: {
    async register(values: any, actions: any) {
      try {
        await this.$apiClient.userRegistration.create(values)
        await this.$router.push({name: 'register-success'})
      } catch (error) {
        console.log(error)
        if (error.status === 400) {
          actions.setErrors(error.data)
        } else if (error.status === 503) {
          actions.setErrors({
            'non-field-error': 'Diese Funktion steht derzeit nicht zur Verfügung'
          })
        } else {
          actions.setErrors({
            'non-field-error': 'Ein unerwarteter Fehler ist aufgetreten'
          })
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/_globals.scss";

.control-buttons {
  margin-top: 1em;
  flex-direction: column;
  align-items: flex-end;
}

.sign-up-link {
  margin-top: 1.5em;
  text-align: center;
}

.privacy-disclaimer {
  padding: 0.2rem;
  font-size: 0.8rem;
}
</style>
