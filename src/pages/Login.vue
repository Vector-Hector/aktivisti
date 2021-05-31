<template>
  <div class="container">
    <QForm
      @submit="login"
    >
      <QInput
        label="Benutzername"
        v-model="username"
        :rules="[$validationRules.isRequired]"
        type="text"
      />
      <QInput
        label="Passwort"
        v-model="password"
        :rules="[$validationRules.isRequired]"
        type="password"
      />

      <div class="control-buttons">

        <QCheckbox
          v-model="saveRefreshToken"
          label="Angemeldet bleiben"
          class="checkbox-margin-right"
        />
        <FormError :error="generalError" />
        <QBtn
          color="primary"
          class="submit-button"
          type="submit"
          :disabled="submitting"
        >
          Anmelden
        </QBtn>
      </div>
    </QForm>

    <div class="sign-in-link">
      Noch kein Konto?
      <router-link
        to="/register"
        class="primary-link"
      >
        Hier registrieren
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { authService } from 'src/api/authService'
import { QBtn, QCheckbox, QForm, QInput } from 'quasar'
import FormError from 'components/FormError.vue'

export default defineComponent({
  name: 'Login',
  components: {
    FormError,
    QForm,
    QBtn,
    QInput,
    QCheckbox
  },
  props: {
    next: {
      type: String as PropType<string>,
      required: false,
      default: '/events'
    }
  },
  data() {
    return {
      submitting: false,
      username: '',
      password: '',
      generalError: null as string | null,
      saveRefreshToken: false
    }
  },
  methods: {
    async login() {
      this.submitting = true
      this.generalError = null
      try {
        await authService.login(this.username, this.password, this.saveRefreshToken)
        await this.$router.push(this.next)
      } catch (error) {
        if (error.response?.status == 400) {
          this.generalError = error.response?.data?.error_description
        }
      }
      this.submitting = false
    }
  }
})
</script>

<style lang="scss" scoped>
@import "src/css/variables.scss";

.error {
  display: inline-flex;
  flex-direction: column;
}

.checkbox-margin-right {
  margin-right: 10px;
}

.control-buttons {
  margin-top: 1em;
  flex-direction: column;
  align-items: flex-end;
  border-bottom: 1px solid $gray-400;
}

.submit-button {
  margin: 1rem 0 3rem 0;
}

.sign-in-link {
  margin-top: 2em;
  text-align: center;
}

.label-floating.sc-ion-label-md-h {
  margin-bottom: 8px;
}
</style>
