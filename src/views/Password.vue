<template>
  <div class="container">
    <div>
      Gib deine E-Mail-Adresse ein und wir senden dir einen Link, um wieder zu deinem Konto zu gelangen.
    </div>
    <Form
      v-slot="{ errors }"
      @submit="sendLink()"
    >
      <IonItem :class="{ 'item-has-error': !!errors.email }">
        <IonLabel position="floating">
          E-Mail-Adresse
        </IonLabel>
        <Field
          v-slot="{ field }"
          v-model="email"
          name="email"
          value="value"
          :rules="isRequired"
        >
          <IonInput
            type="email"
            v-bind="field"
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

      <div class="control-buttons">
        <IonButton
          color="primary"
          type="submit"
        >
          Sende Login Link
        </IonButton>
      </div>
    </Form>

    <IonItemDivider />

    <div class="sign-up-link">
      Noch kein Konto?
      <router-link
        to="/register"
      >
        Hier registrieren
      </router-link>
    </div>

    <div class="sign-up-link">
      Du bist bereits angemeldet?
      <router-link to="/login">
        Zum Login
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Field, Form, ErrorMessage } from 'vee-validate'
import {
  IonInput,
  IonLabel,
  IonItem,
  IonButton,
  IonItemDivider,
} from "@ionic/vue";

export default defineComponent({
  name: "Password",
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
    async sendLink() {

    },
    isRequired (value: string) {
      if (!value) {
        return 'Bitte fülle dieses Feld aus'
      }
      return true
    }
  },
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
</style>
