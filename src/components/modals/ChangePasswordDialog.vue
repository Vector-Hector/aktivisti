<script setup lang="ts">
import { ref } from 'vue'
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QForm,
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
  (e: 'ok'): void
  (e: 'hide'): void
}
const emit = defineEmits<Emits>()

const $q = useQuasar()
const { t } = useI18n()
const { validationRules } = useValidationRules()
const dialog = ref<InstanceType<typeof QDialog> | null>(null)

const oldPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
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
    await apiClient.account.changePassword({
      old_password: oldPassword.value,
      new_password: newPassword.value
    })
    $q.notify({
      message: t('profile.changePasswordDialog.notifications.success'),
      color: 'positive'
    })
    emit('ok')
    emit('hide')
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response.data
    }
    $q.notify({
      message: t('profile.changePasswordDialog.notifications.generalError'),
      color: 'negative'
    })
  } finally {
    isSubmitting.value = false
  }
}
function onDialogHide() {
  emit('hide')
}
function passwordMatch(value: string) {
  if (newPassword.value === value) {
    return true
  } else {
    return t('profile.changePasswordDialog.notifications.noMatchingPassword')
  }
}
</script>

<template>
  <QDialog ref="dialog" @hide="onDialogHide">
    <QCard class="change-email-dialog">
      <QToolbar>
        <QToolbarTitle>{{
          $t('profile.changePasswordDialog.title')
        }}</QToolbarTitle>
      </QToolbar>
      <QForm @submit="onOk">
        <QCardSection>
          <p>
            {{ $t('profile.changePasswordDialog.description') }}
          </p>
          <PasswordInput
            :label="$t('profile.changePasswordDialog.currentPassword')"
            v-model="oldPassword"
            :minlength="8"
            :rules="[validationRules.isRequired]"
            :error-message="errors.old_password?.[0]"
            :error="!!errors.old_password?.length"
          />
          <PasswordInput
            :label="$t('profile.changePasswordDialog.newPassword')"
            v-model="newPassword"
            :minlength="8"
            :rules="[validationRules.isRequired]"
            :error-message="errors.new_password?.[0]"
            :error="!!errors.new_password?.length"
          />
          <PasswordInput
            :label="$t('profile.changePasswordDialog.confirmNewPassword')"
            v-model="newPasswordConfirm"
            :minlength="8"
            :rules="[validationRules.isRequired, passwordMatch]"
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
            :label="$t('profile.changePasswordDialog.submitButton')"
            type="submit"
          />
        </QCardActions>
      </QForm>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped></style>
