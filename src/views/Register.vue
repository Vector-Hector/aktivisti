<template>
  <div class="container">
    <h2>Anmelden</h2>
    <IonItem>
      <IonLabel position="floating">
        E-Mail-Adresse
      </IonLabel>
      <IonInput type="email" />
    </IonItem>

    <IonItem>
      <IonLabel position="floating">
        Vorname
      </IonLabel>
      <IonInput />
    </IonItem>

    <IonItem>
      <IonLabel position="floating">
        Nachname
      </IonLabel>
      <IonInput />
    </IonItem>

    <IonItem>
      <IonLabel position="floating">
        Benutzername
      </IonLabel>
      <IonInput />
    </IonItem>

    <IonItem>
      <IonLabel position="floating">
        Passwort
      </IonLabel>
      <IonInput type="password" />
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
        @click="register()"
      >
        Registrieren
      </IonButton>
    </div>

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
import { ApiClient } from '@/api'
const apiClient = new ApiClient()

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
  },
  data() {
    return {};
  },
  methods: {
    async register() {
      const response = await apiClient.token.list()
      localStorage.setItem('token', JSON.stringify(response.payload.data))
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
