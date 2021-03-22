<template>
  <div class="container">
    <h2>Anmelden</h2>
    <Form
      v-slot="{ errors }"
      @submit="register()"
    >
      <IonItem :class="{ 'item-has-error': !!errors.email }">
        <IonLabel position="floating">
          E-Mail-Adresse
        </IonLabel>
        <Field
          v-slot="{ field }"
          v-model="email"
          :rules="isRequired"
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

      <IonItem :class="{ 'item-has-error': !!errors.givenname }">
        <IonLabel position="floating">
          Vorname
        </IonLabel>
        <Field
          v-slot="{ field }"
          v-model="givenname"
          :rules="isRequired"
          name="givenname"
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
          name="givenname"
          class="error"
        />
      </IonItem>

      <IonItem :class="{ 'item-has-error': !!errors.surname }">
        <IonLabel position="floating">
          Nachname
        </IonLabel>
        <Field
          v-slot="{ field }"
          v-model="surname"
          :rules="isRequired"
          name="surname"
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
          name="surname"
          class="error"
        />
      </IonItem>

      <IonItem :class="{ 'item-has-error': !!errors.username }">
        <IonLabel position="floating">
          Benutzername
        </IonLabel>
        <Field
          v-slot="{ field }"
          v-model="username"
          :rules="isRequired"
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
          v-model="password"
          :rules="isRequired"
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

      <div class="privacy-margin">
        Mit deiner Registrierung nimmst du die
        <a
          href="https://www.die-linke.de/seitenfuss/datenschutz/"
          target="_blank"
        >Datenschutzbestimmungen</a>
        zur Kenntnis.
      </div>

      <div class="control-buttons">
        <IonButton
          color="primary"
          type="submit"
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
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Field, Form, ErrorMessage } from 'vee-validate'

import {
  IonInput,
  IonLabel,
  IonItem,
  IonButton,
  IonItemDivider,
} from "@ionic/vue";

export default defineComponent({
  name: "Register",
  components: {
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
    IonItemDivider,
    Field,
    Form,
    ErrorMessage,
  },
  data() {
    return {};
  },
  methods: {
    async register() {
      // TODO
    },
    isRequired (value: string) {
      if (!value) {
        return 'Bitte fülle dieses Feld aus'
      }
      return true
    }
  }
});
</script>

<style lang="scss" scoped>
@import "src/scss/_globals.scss";
.control-buttons {
  margin-top: 1em;
  flex-direction: column;
  align-items: flex-end;
}

.sign-up-link {
  margin-top: 1.5em;
  text-align: center;
}

.privacy-margin {
  margin-top: 2em;
}
</style>
