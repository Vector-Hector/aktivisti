<template>
  <div class="container">
    <h2>Passwort vergessen?</h2>
    <div>
      Gib deine E-Mail-Adresse ein und wir senden dir einen Link, um wieder zu deinem Konto zu gelangen.
    </div>

    <IonItem>
      <IonLabel position="floating">
        E-Mail-Adresse
      </IonLabel>
      <IonInput type="email" />
    </IonItem>

    <div class="control-buttons">
      <IonButton color="primary">
        Sende Login Link
      </IonButton>
    </div>

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
  },
  data() {
    return {};
  },
  methods: {},
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
