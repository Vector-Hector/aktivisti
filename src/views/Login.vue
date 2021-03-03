<template>
  <div class="container">
    <h2>Login</h2>
    <IonItem>
      <IonLabel position="floating">
        Benutzername oder E-Mail-Adresse
      </IonLabel>
      <IonInput v-model="username" />
    </IonItem>

    <IonItem>
      <IonLabel position="floating">
        Passwort
      </IonLabel>
      <IonInput
        v-model="password"
        type="password"
      />
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
import { defineComponent, PropType } from 'vue'
import { IonInput, IonLabel, IonItem, IonButton, IonCheckbox, IonItemDivider } from '@ionic/vue'
import { authService } from '@/api/authService'
import { RouteLocation } from 'vue-router'

export default defineComponent({
  name: 'Login',
  components: {
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
    IonCheckbox,
    IonItemDivider
  },
  props: {
    redirect: {
      type: Object as PropType<RouteLocation>,
      required: false,
      default: {name: 'events'}
    }
  },
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async login() {
      const userParams = {
        grant_type: 'password',
        username: this.username,
        password: this.password,
        client_id: process.env.VUE_APP_CLIENT_ID
      }

      const authRequest = (await this.$oauth2Client.token(userParams))

      if (authRequest.response.status !== 200) {
        return
      } else {
        authService.login(authRequest.payload)
        this.$router.push(this.redirect)
      }
    }
  }
})
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
