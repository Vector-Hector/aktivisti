<template>
  <QDialog ref="dialog" @hide="onDialogHide">
    <QCard class="change-email-dialog">
      <QToolbar>
        <QToolbarTitle>Passwort ändern</QToolbarTitle>
      </QToolbar>
      <QForm @submit="onOk">
        <QCardSection>
          <p>
            Hier kannst du eine neues Passwort eingeben. Gib dazu dein aktuelles
            und das neue Passwort ein
          </p>
          <PasswordInput
            label="Aktuelles Passwort"
            v-model="oldPassword"
            :minlength="8"
            :rules="[$validationRules.isRequired]"
            :error-message="errors.old_password?.[0]"
            :error="!!errors.old_password?.length"
          />
          <PasswordInput
            label="Neues Passwort"
            v-model="newPassword"
            :minlength="8"
            :rules="[$validationRules.isRequired]"
            :error-message="errors.new_password?.[0]"
            :error="!!errors.new_password?.length"
          />
          <PasswordInput
            label="Neues Passwort bestätigen"
            v-model="newPasswordConfirm"
            :minlength="8"
            :rules="[$validationRules.isRequired, passwordMatch]"
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

<script lang="ts">
import { defineComponent } from 'vue'
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QForm,
  QToolbar,
  QToolbarTitle
} from 'quasar'
import PasswordInput from 'components/PasswordInput.vue'

export default defineComponent({
  name: 'ChangeEmailDialog',
  components: {
    PasswordInput,
    QDialog,
    QCard,
    QCardSection,
    QToolbar,
    QToolbarTitle,
    QCardActions,
    QBtn,
    QForm
  },
  emits: [
    // REQUIRED
    'ok',
    'hide'
  ],
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      errors: {},
      isSubmitting: false
    }
  },
  methods: {
    show() {
      // @ts-ignore
      this.$refs.dialog.show()
    },
    hide() {
      // @ts-ignore
      this.$refs.dialog.hide()
    },
    async onOk() {
      this.errors = {}
      this.isSubmitting = true
      try {
        await this.$apiClient.account.changePassword({
          old_password: this.oldPassword,
          new_password: this.newPassword
        })
        this.$q.notify({
          message: 'Passwort wurde geändert',
          color: 'positive'
        })
        this.$emit('ok')
        this.$emit('hide')
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response?.status === 400) {
          this.errors = e.response.data
        }
        this.$q.notify({
          message: 'Etwas ging schief beim Ändern des Passworts',
          color: 'negative'
        })
      } finally {
        this.isSubmitting = false
      }
    },
    onDialogHide() {
      this.$emit('hide')
    },
    passwordMatch(value: string) {
      if (this.newPassword === value) {
        return true
      } else {
        return 'Die Passwörter müssen übereinstimmen'
      }
    }
  }
})
</script>

<style lang="scss" scoped></style>
