<template>
  <div class="container">
    <QForm @submit="login">
      <QInput
        label="Benutzer*innenname"
        v-model="username"
        :rules="[$validationRules.isRequired]"
        type="text"
      />
      <PasswordInput
        label="Passwort"
        v-model="password"
        :rules="[$validationRules.isRequired]"
      />
      <div class="forgot-password-link">
        Passwort
        <a @click="openResetPasswordModal" class="primary-link">
          zurücksetzen
        </a>
      </div>

      <div class="control-buttons">
        <QCheckbox
          v-model="longSession"
          label="Angemeldet bleiben"
          class="checkbox-margin-right"
        />
        <FormError :error="nonFieldError" />
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
      <router-link to="/register" class="primary-link">
        Hier registrieren
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { QBtn, QCheckbox, QForm, QInput } from 'quasar'
import FormError from 'components/FormError.vue'
import { AuthType, getAuthStore, getAuthType } from 'src/store/AuthStore'
import PasswordInput from 'components/PasswordInput.vue'
import { apiClient } from 'src/api/ApiClient'
import { emailRegex } from 'boot/validation-rules'

const authStore = getAuthStore()

export default defineComponent({
  name: 'Login',
  components: {
    FormError,
    PasswordInput,
    QForm,
    QBtn,
    QInput,
    QCheckbox
  },
  beforeRouteEnter(to, from, next) {
    if (authStore.isLoggedIn()) {
      next({ name: 'events' })
    } else {
      next()
    }
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
      nonFieldError: null as string | null,
      longSession: true
    }
  },
  methods: {
    async login() {
      this.submitting = true
      this.nonFieldError = null
      try {
        await authStore.login(this.username, this.password, this.longSession)
        await this.$router.push(this.next)
      } catch (error) {
        if (
          apiClient.isApiClientError(error) &&
          error.response?.status == 400
        ) {
          const authType = getAuthType()
          if (authType === AuthType.SESSION) {
            this.nonFieldError = error.response?.data?.non_field_errors?.[0]
          } else {
            this.nonFieldError = 'Die eingegebenen Zugangsdaten sind ungültig'
          }
        }
      }
      this.submitting = false
    },
    openResetPasswordModal() {
      this.$q
        .dialog({
          title: 'Passwort zurücksetzen',
          message:
            'Gib hier deine E-Mail Adresse ein. Wir schicken dir eine E-Mail mit Anweisungen, wie du dein Passwort zurücksetzen kannst.',
          prompt: {
            model: '',
            isValid: (val: string) => !!val && emailRegex.test(val),
            type: 'email'
          },
          cancel: true,
          persistent: true
        })
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .onOk(async (value: string) => {
          try {
            await this.$apiClient.forgotPassword.create({
              email: value
            })
            this.$q.notify({
              color: 'positive',
              message:
                'Bitte sieh nun in deinem Postfach nach. Wir haben dir eine E-Mail mit weiteren Anweisungen geschickt.'
            })
          } catch (e) {
            let error =
              'Beim versuch dein Passwort zurückzusetzen trat ein Fehler auf'
            if (
              this.$apiClient.isApiClientError(e) &&
              e.response?.data?.email
            ) {
              error = e.response?.data?.email
            }
            this.$q.notify({
              color: 'negative',
              message: error
            })
          }
        })
    }
  }
})
</script>

<style lang="scss" scoped>
@import 'src/css/variables.scss';

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
  border-bottom: 1px solid $grey-3;
}

.submit-button {
  margin: 1rem 0 3rem 0;
}

.forgot-password-link {
  a {
    text-decoration: underline;
  }
}

.sign-in-link {
  margin-top: 2em;
  text-align: center;
}

.label-floating.sc-ion-label-md-h {
  margin-bottom: 8px;
}
</style>
