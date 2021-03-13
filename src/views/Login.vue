<template>
  <div class="container">
    <h2>Login</h2>
    <Form @submit="login()">
      <IonItem>
        <IonLabel position="floating">
          Benutzername oder E-Mail-Adresse
        </IonLabel>
        <Field
          v-slot="{field}"
          name="username"
          :rules="isRequired"
        >
          <IonInput
            name="username"
            v-bind="field"
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

      <IonItem>
        <IonLabel position="floating">
          Passwort
        </IonLabel>
        <Field
          v-slot="{field}"
          name="password"
          :rules="isRequired"
        >
          <IonInput
            name="password"
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
          type="submit"
        >
          Anmelden
        </IonButton>
      </div>
    </Form>

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
import { Field, Form, ErrorMessage } from 'vee-validate'

export default defineComponent({
  name: 'Login',
  components: {
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
    IonCheckbox,
    IonItemDivider,
    Field,
    Form,
    ErrorMessage,
  },
  props: {
    redirect: {
      type: Object as PropType<RouteLocation>,
      required: false,
      default: {name: 'events'}
    }
  },
  data() {
    function isRequired(value: string) {
      if (!value) return 'Bitte fülle dieses Feld aus'
      return true
    }
    return {
      username: '',
      password: '',
      isRequired,
    }
  },
  methods: {
    async login() {
      await authService.login(this.username, this.password)
      this.$router.push(this.redirect)
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

.label-floating.sc-ion-label-md-h  {
  margin-bottom: 8px;
}

</style>
