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
import { userStore } from '@/store/UserStore'
import { uiStore } from '@/store/UiStore'

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
      // TODO send user data to the BE and receive token, userId etc.
      const response = await apiClient.token.list()
      
      // const token = response.payload.data.token
      // Property 'token' does not exist on type 'TokenDto[]
      // TODO only store token
      localStorage.setItem('token', JSON.stringify(response.payload.data))
      localStorage.setItem('refreshToken', JSON.stringify(response.payload.data))
      localStorage.setItem('isNew', JSON.stringify(true))

      // TODO use user input and data from BE
      const userData = {
        id: "602ce1a5158b7e35c8eb50c0",
        name: "Test",
        email: "test@test.de",
      }
      localStorage.setItem('user', JSON.stringify(userData))
      
      await this.$router.push('/events')

      userStore.mockLogin()
      uiStore.toggleSidebar(true)
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
