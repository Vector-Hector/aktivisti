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

<script lang="ts">
import { defineComponent } from 'vue'
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QForm,
  QInput,
  QToolbar,
  QToolbarTitle
} from 'quasar'

export default defineComponent({
  name: 'ChangeEmailDialog',
  components: {
    QDialog,
    QCard,
    QCardSection,
    QToolbar,
    QToolbarTitle,
    QInput,
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
      newEmail: '',
      password: '',
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
        await this.$apiClient.account.changeEmail({
          password: this.password,
          new_email: this.newEmail
        })
        this.$q.notify({
          message: 'Bestätigungsmail wurde verschickt',
          color: 'positive'
        })
        this.$emit('ok', {
          password: this.password,
          email: this.newEmail
        })
        this.$emit('hide')
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response?.status === 400) {
          this.errors = e.response.data
        }
        this.$q.notify({
          message: 'Etwas ging schief beim Ändern der E-Mail Adresse',
          color: 'negative'
        })
      } finally {
        this.isSubmitting = false
      }
    },
    onDialogHide() {
      this.$emit('hide')
    }
  }
})
</script>

<style lang="scss" scoped></style>
