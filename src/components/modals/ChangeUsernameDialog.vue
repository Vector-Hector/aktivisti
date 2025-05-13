<script setup lang="ts">
import { ref } from 'vue'
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QForm,
  QInput,
  QToolbar,
  QToolbarTitle,
  useQuasar
} from 'quasar'
import PasswordInput from 'components/PasswordInput.vue'
import { apiClient } from 'src/api/ApiClient'
import { useValidationRules } from 'src/utils/validationRules'
import { useI18n } from 'vue-i18n'

interface Emits {
  // REQUIRED
  (e: 'ok', newUsername: string): void
  (e: 'hide'): void
}
const emit = defineEmits<Emits>()

const $q = useQuasar()
const { t } = useI18n()
const { validationRules } = useValidationRules()
const dialog = ref<InstanceType<typeof QDialog> | null>(null)

const newUsername = ref('')
const password = ref('')
const errors = ref<any>({})
const isSubmitting = ref(false)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function show() {
  dialog.value?.show()
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hide() {
  dialog.value?.hide()
}
async function onOk() {
  errors.value = {}
  isSubmitting.value = true
  try {
    await apiClient.account.changeUsername({
      password: password.value,
      new_username: newUsername.value
    })
    $q.notify({
      message: t('profile.changeUsernameDialog.notifications.success'),
      color: 'positive'
    })
    emit('ok', newUsername.value)
    emit('hide')
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response.data
    }
    $q.notify({
      message: t('profile.changeUsernameDialog.notifications.error'),
      color: 'negative'
    })
  } finally {
    isSubmitting.value = false
  }
}
function onDialogHide() {
  emit('hide')
}
</script>

<template>
  <QDialog ref="dialog">
    <QCard class="change-username-dialog">
      <QToolbar>
        <QToolbarTitle>{{
          $t('profile.changeUsernameDialog.title')
        }}</QToolbarTitle>
      </QToolbar>
      <QForm @submit="onOk">
        <QCardSection>
          <p>
            {{ $t('profile.changeUsernameDialog.description') }}
          </p>
          <PasswordInput
            :label="$t('profile.changeUsernameDialog.passwordInput')"
            v-model="password"
            :minlength="8"
            :rules="[validationRules.isRequired]"
            :error-message="errors.password?.[0]"
            :error="!!errors.password?.length"
          />
          <QInput
            :label="$t('profile.changeUsernameDialog.newUsername')"
            v-model="newUsername"
            :rules="[validationRules.isRequired]"
            :error-message="errors.new_username?.[0]"
            :error="!!errors.new_username?.length"
          />
        </QCardSection>
        <QCardActions align="right">
          <QBtn
            flat
            :disabled="isSubmitting"
            color="primary"
            :label="$t('general.cancel')"
            @click="onDialogHide"
          />
          <QBtn
            flat
            :disabled="isSubmitting"
            color="primary"
            :label="$t('profile.changeUsernameDialog.submitButton')"
            type="submit"
          />
        </QCardActions>
      </QForm>
    </QCard>
  </QDialog>
</template>
