<script setup lang="ts">
import { ref } from 'vue'

import { UserRegistrationDto } from 'src/api/model/UserRegistrationDto'
import { QBtn, QForm, QInput, QPage, QScrollArea, useQuasar } from 'quasar'
import FormError from 'components/FormError.vue'
import { configStore } from 'src/store/ConfigStore'
import PasswordInput from 'components/PasswordInput.vue'
import { apiClient } from 'src/api/ApiClient'
import { useRouter } from 'vue-router'
import { useValidationRules } from 'src/utils/validationRules'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()
const $router = useRouter()
const { validationRules } = useValidationRules()

const registrationData = ref<Partial<UserRegistrationDto>>({})
const errors = ref<any>({})
const submitting = ref(false)

if (configStore.getState().service_config.registration_disabled) {
  $q.dialog({
    title: t('register.betaDialog.title'),
    message: t('register.betaDialog.description')
  })
}

async function register() {
  submitting.value = true
  try {
    await apiClient.userRegistration.create(registrationData.value)
    await $router.push({ name: 'register-success' })
  } catch (error) {
    if (apiClient.isApiClientError(error)) {
      if (error.response?.status === 400) {
        errors.value = error.response.data
      } else if (error.response?.status === 503) {
        errors.value = {
          non_field_error: t('register.notifications.functionalityNotAvailable')
        }
      }
    } else {
      errors.value = {
        non_field_error: t('register.notifications.unknownError')
      }
    }
  }
  submitting.value = false
}
</script>

<template>
  <QScrollArea class="flex flex-fill">
    <QPage>
      <div class="container">
        <QForm @submit="register">
          <QInput
            v-model="registrationData.email"
            :rules="[validationRules.isRequired, validationRules.email]"
            name="email"
            :label="`${$t('register.email')} *`"
            :error-message="errors.email?.[0]"
            :error="!!errors.email?.length"
          />
          <QInput
            v-model="registrationData.username"
            :rules="[validationRules.isRequired]"
            name="username"
            :label="`${$t('register.username')} *`"
            :error-message="errors.username?.[0]"
            :error="!!errors.username?.length"
          />
          <PasswordInput
            v-model="registrationData.password"
            :rules="[validationRules.isRequired]"
            name="password"
            :label="`${$t('register.password')} *`"
            :minlength="6"
            :error-message="errors.password?.[0]"
            :error="!!errors.password?.length"
          />
          <QInput
            v-model="registrationData.plz"
            :rules="[validationRules.isRequired]"
            :maxlength="5"
            :minlength="5"
            :label="`${$t('register.zipCode')} *`"
            name="plz"
            :error-message="errors.plz?.[0]"
            :error="!!errors.plz?.length"
          />
          <QInput
            v-model="registrationData.first_name"
            name="first_name"
            :label="$t('register.firstName')"
            :error-message="errors.first_name?.[0]"
            :error="!!errors.first_name?.length"
          />
          <QInput
            v-model="registrationData.last_name"
            name="last_name"
            :label="$t('register.lastName')"
            :error-message="errors.last_name?.[0]"
            :error="!!errors.last_name?.length"
          />

          <div class="privacy-disclaimer">
            <p>
              <i18n-t
                keypath="register.privacyDisclaimer.description"
                tag="div"
              >
                <template #email>
                  <a
                    :href="`mailto:${$t('register.privacyDisclaimer.email')}`"
                    class="primary-link"
                    >{{ $t('register.privacyDisclaimer.email') }}</a
                  >
                </template>
                <template #link>
                  <a
                    :href="$t('register.privacyDisclaimer.link_address')"
                    target="_blank"
                    class="primary-link"
                  >
                    {{ $t('register.privacyDisclaimer.link_label') }}
                  </a>
                </template>
              </i18n-t>
            </p>
          </div>
          <FormError :error="errors.non_field_error?.[0]" />
          <div class="control-buttons">
            <QBtn color="primary" type="submit" :disabled="submitting">
              {{ $t('register.submitButton') }}
            </QBtn>
          </div>
        </QForm>

        <div class="sign-up-link">
          {{ $t('register.accountAlreadyExists') }}
          <router-link to="/login" class="primary-link">
            {{ $t('register.goToLogin') }}
          </router-link>
        </div>
      </div>
    </QPage>
  </QScrollArea>
</template>

<style lang="scss" scoped>
.control-buttons {
  margin-top: 1em;
  flex-direction: column;
  align-items: flex-end;
}

.sign-up-link {
  margin-top: 1.5em;
  text-align: center;
}

.privacy-disclaimer {
  padding: 0.2rem;
  font-size: 0.8rem;
}
</style>
