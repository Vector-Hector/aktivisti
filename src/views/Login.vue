<template>
  <div class="container">
    <h2>Login</h2>
    <IonItem>
      <IonLabel position="floating">
        Benutzername oder E-Mail-Adresse
      </IonLabel>
      <IonInput />
    </IonItem>

    <IonItem>
      <IonLabel position="floating">
        Passwort
      </IonLabel>
      <IonInput type="password" />
    </IonItem>

    <IonItem lines="none">
      <IonLabel>
        <router-link
          to="/password"
        >
          Passwort vergessen?
        </router-link>
      </IonLabel>
    </IonItem>

    <div class="control-buttons">
      <IonItem lines="none">
        <IonCheckbox class="checkbox-margin-right" />
        <IonLabel>Angemeldet bleiben</IonLabel>
      </IonItem>
      <IonButton
        color="primary"
        @click="login()"
      >
        Anmelden
      </IonButton>
    </div>

    <IonItemDivider />

    <div class="sign-in-link">
      Noch kein Konto?
      <router-link
        to="/register"
      >
        Hier registrieren
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonInput, IonLabel, IonItem, IonButton, IonCheckbox, IonItemDivider } from "@ionic/vue";
import { userStore } from '@/store/UserStore'
import { uiStore } from '@/store/UiStore'
import { tokenService } from '@/store/TokenService'
import { ApiClient } from "@/api";

const apiClient = new ApiClient()

export default defineComponent({
  name: "Login",
  components: {
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
    IonCheckbox,
    IonItemDivider,
  },
  data() {
    return {};
  },
  methods: {
    async login() {
      userStore.mockLogin()
      uiStore.toggleSidebar(true)

      const auth = (await apiClient.token.list()).payload.data[0]
      tokenService.setToken('access_token', JSON.stringify(auth.access_token))
      tokenService.setToken('refresh_token', JSON.stringify(auth.refresh_token))
      tokenService.setExpiry(new Date().getTime() + auth.expires_in)

      // TODO use user input and data from BE
      const userData = {
        id: "602ce1a5158b7e35c8eb50c0",
        username: "Test",
        email: "test@test.de",
      }
      // userStore.setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

    }
  },
});
</script>

<style lang="scss" scoped>
@import "src/scss/_globals.scss";
.checkbox-margin-right {
  margin-right: 10px;
}

.control-buttons {
  margin-top: 1em;
  flex-direction: column;
  align-items: flex-end;
}

.sign-in-link {
  margin-top: 2em;
  text-align: center;
}
</style>
