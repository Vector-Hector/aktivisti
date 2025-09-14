<script setup lang="ts">
import { ref } from 'vue'
import { QBtn, QCheckbox, QForm, QInput, useQuasar } from 'quasar'
import FormError from 'components/FormError.vue'
import { AuthType, getAuthStore, getAuthType } from 'src/store/AuthStore'
import PasswordInput from 'components/PasswordInput.vue'
import { apiClient } from 'src/api/ApiClient'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { emailRegex, useValidationRules } from 'src/utils/validationRules'

const authStore = getAuthStore()

const $q = useQuasar()
const $router = useRouter()
const { t } = useI18n()
const { validationRules } = useValidationRules()

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
        nonFieldError.value = t('login.invalidCredentials')
      }
    }
  }
  submitting.value = false
}
function openResetPasswordModal() {
  $q.dialog({
    title: t('login.resetPassword.title'),
    message: t('login.resetPassword.message'),
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
          message: t('login.resetPassword.successMessage')
        })
      } catch (e) {
        let error = t('login.resetPassword.errorMessage')
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
        :label="$t('login.usernameLabel')"
        v-model="username"
        :rules="[validationRules.isRequired]"
        type="text"
      />
      <PasswordInput
        :label="$t('login.passwordLabel')"
        v-model="password"
        :rules="[validationRules.isRequired]"
      />
      <div class="forgot-password-link">
        <a @click="openResetPasswordModal" class="primary-link">
          {{ $t('login.forgetPassword') }}
        </a>
      </div>

      <div class="control-buttons">
        <QCheckbox
          v-model="longSession"
          :label="$t('login.rememberMe')"
          class="checkbox-margin-right"
        />
        <FormError :error="nonFieldError" />
        <QBtn
          color="primary"
          class="submit-button"
          type="submit"
          :disabled="submitting"
        >
          {{ t('login.submitButton') }}
        </QBtn>
      </div>
    </QForm>
    <div class="sign-in-link">
      {{ $t('login.register.noAccount') }}
      <router-link to="/register" class="primary-link">
        {{ $t('login.register.registerHere') }}
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
