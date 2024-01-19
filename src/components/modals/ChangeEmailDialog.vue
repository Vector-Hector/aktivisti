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
const dialog = ref<InstanceType<typeof QDialog> | null>(null)

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
      message: 'Bestätigungsmail wurde verschickt',
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
      message: 'Etwas ging schief beim Ändern der E-Mail Adresse',
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
        <QToolbarTitle>E-Mail Adresse ändern</QToolbarTitle>
      </QToolbar>
      <QForm @submit="onOk">
        <QCardSection>
          <p>
            Hier kannst du eine neue E-Mail Adresse festlegen. Dazu brauchen wir
            noch einmal dein aktuelles Passwort. Die E-Mail Adresse wird erst in
            deinem Profil übernommen, wenn du den Bestätigungslink anklickst,
            den wir an deine neue E-Mail Adresse schicken.
          </p>
          <QInput
            label="Passwort"
            v-model="password"
            type="password"
            :minlength="8"
            :rules="[$validationRules.isRequired]"
            :error-message="errors.password?.[0]"
            :error="!!errors.password?.length"
          />
          <QInput
            label="Neue E-Mail Adresse"
            v-model="newEmail"
            :rules="[$validationRules.email]"
            :error-message="errors.new_email?.[0]"
            :error="!!errors.new_email?.length"
          />
        </QCardSection>
        <QCardActions align="right">
          <QBtn
            flat
            :disabled="isSubmitting"
            color="primary"
            label="Abbrechen"
            @click="onDialogHide"
          />
          <QBtn
            flat
            :disabled="isSubmitting"
            color="primary"
            label="OK"
            type="submit"
          />
        </QCardActions>
      </QForm>
    </QCard>
  </QDialog>
</template>

<style lang="scss" scoped></style>
