<script setup lang="ts">
import { ref } from 'vue'
import { QBtn, QCheckbox, QForm, QInput, useQuasar } from 'quasar'
import FormError from 'components/FormError.vue'
import { AuthType, getAuthStore, getAuthType } from 'src/store/AuthStore'
import PasswordInput from 'components/PasswordInput.vue'
import { apiClient } from 'src/api/ApiClient'
import { emailRegex } from 'boot/validation-rules'
import { useRouter } from 'vue-router'

const authStore = getAuthStore()

const $q = useQuasar()
const $router = useRouter()

if (authStore.isLoggedIn()) {
  void $router.replace({ name: 'events' })
}

interface Props {
  next?: string
}
const props = withDefaults(defineProps<Props>(), {
  next: '/events'
})

const submitting = ref(false)
const username = ref('')
const password = ref('')
const nonFieldError = ref<string | null>(null)
const longSession = ref(true)

async function login() {
  submitting.value = true
  nonFieldError.value = null
  try {
    await authStore.login(username.value, password.value, longSession.value)
    await $router.push(props.next)
  } catch (error) {
    if (apiClient.isApiClientError(error) && error.response?.status == 400) {
      const authType = getAuthType()
      if (authType === AuthType.SESSION) {
        nonFieldError.value = error.response?.data?.non_field_errors?.[0]
      } else {
        nonFieldError.value = 'Die eingegebenen Zugangsdaten sind ungültig'
      }
    }
  }
  submitting.value = false
}
function openResetPasswordModal() {
  $q.dialog({
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
        await apiClient.forgotPassword.create({
          email: value
        })
        $q.notify({
          color: 'positive',
          message:
            'Bitte sieh nun in deinem Postfach nach. Wir haben dir eine E-Mail mit weiteren Anweisungen geschickt.'
        })
      } catch (e) {
        let error =
          'Beim versuch dein Passwort zurückzusetzen trat ein Fehler auf'
        if (apiClient.isApiClientError(e) && e.response?.data?.email) {
          error = e.response?.data?.email
        }
        $q.notify({
          color: 'negative',
          message: error
        })
      }
    })
}
</script>

<template>
  <div class="container">
    <div class="logo-splash-container">
      <img src="../assets/logo_aktivisti.svg" class="q-my-md logo-splash" />
    </div>
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

.logo-splash-container {
  display: flex;
  justify-content: center;
}

.logo-splash {
  width: 50%;
}

@media (min-width: $breakpoint-sm-min) {
  .logo-splash {
    width: 30%;
  }
}
</style>
