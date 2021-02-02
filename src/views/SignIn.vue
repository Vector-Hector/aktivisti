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
      <IonInput />
    </IonItem>

    <IonItem lines="none">
      <IonCheckbox class="checkbox-margin-right" />
      <IonLabel>Angemeldet bleiben</IonLabel>
    </IonItem>

    <div class="control-buttons">
      <IonButton color="primary">
        Anmelden
      </IonButton>
    </div>

    <IonItemDivider />

    <div>Noch kein Konto? Hier registrieren</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonInput, IonLabel, IonItem, IonButton, IonCheckbox, IonItemDivider } from "@ionic/vue";

export default defineComponent({
  name: "SignIn",
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
  methods: {},
});
</script>

<style lang="scss" scoped>
@import "src/scss/_globals.scss";
.checkbox-margin-right {
  margin-right: 15px;
}

.control-buttons {
  margin-top: 1.5em;
}
</style>
