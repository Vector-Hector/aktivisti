<template>
  <div class="container">
    <IonText>
      <h1>Vielen Dank</h1>
      <p>
        Die Registrierung war erfolgreich. Bitte schaue in dein Postfach um sie zu bestätigen, danach kannst du dich
        bei der App anmelden.
      </p>
    </IonText>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  IonText
} from '@ionic/vue'

export default defineComponent({
  name: 'RegistrationSuccess',
  components: {
    IonText
  }
})
</script>

<style lang="scss" scoped>
</style>
