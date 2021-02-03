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
    login() {
      userStore.mockLogin()
      uiStore.toggleSidebar(true)
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
