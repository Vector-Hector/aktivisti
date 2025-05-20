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
import { apiClient } from 'src/api/ApiClient'
import { useValidationRules } from 'src/utils/validationRules'
import { useI18n } from 'vue-i18n'

interface Emits {
  // REQUIRED
  (
    e: 'ok',
    newCrendetials: {
      password: string
      email: string
    }
  ): void
  (e: 'hide'): void
}
const emit = defineEmits<Emits>()

const $q = useQuasar()
const { t } = useI18n()
const dialog = ref<InstanceType<typeof QDialog> | null>(null)
const { validationRules } = useValidationRules()

const newEmail = ref('')
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
    await apiClient.account.changeEmail({
      password: password.value,
      new_email: newEmail.value
    })
    $q.notify({
      message: t('profile.changeEmailDialog.notifications.success'),
      color: 'positive'
    })
    emit('ok', {
      password: password.value,
      email: newEmail.value
    })
    emit('hide')
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response.data
    }
    $q.notify({
      message: t('profile.changeEmailDialog.notifications.error'),
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
  <QDialog ref="dialog" @hide="onDialogHide">
    <QCard class="change-email-dialog">
      <QToolbar>
        <QToolbarTitle>{{
          $t('profile.changeEmailDialog.title')
        }}</QToolbarTitle>
      </QToolbar>
      <QForm @submit="onOk">
        <QCardSection>
          <p>
            {{ $t('profile.changeEmailDialog.description') }}
          </p>
          <QInput
            :label="$t('profile.changeEmailDialog.passwordInput')"
            v-model="password"
            type="password"
            :minlength="8"
            :rules="[validationRules.isRequired]"
            :error-message="errors.password?.[0]"
            :error="!!errors.password?.length"
          />
          <QInput
            :label="$t('profile.changeEmailDialog.newEmailAddress')"
            v-model="newEmail"
            :rules="[validationRules.email]"
            :error-message="errors.new_email?.[0]"
            :error="!!errors.new_email?.length"
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
            :label="$t('profile.changeEmailDialog.submitButton')"
            type="submit"
          />
        </QCardActions>
      </QForm>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped></style>
