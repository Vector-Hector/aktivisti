<template>
  <QDialog ref="dialog">
    <QCard class="change-username-dialog">
      <QToolbar>
        <QToolbarTitle>Benutzer*innenname ändern</QToolbarTitle>
      </QToolbar>
      <QForm
        @submit="onOk"
      >
        <QCardSection>
          <p>
            Hier kannst du eine neuen Benutzer*innenname festlegen. Dazu brauchen wir noch einmal dein aktuelles
            Passwort.
            Nachdem du dein Benutzer*innenname geändert hast, ist dein alter Benutzer*innenname für alle anderen
            Benutzer*innen verfügbar.
          </p>
          <PasswordInput
            label="Passwort"
            v-model="password"
            :minlength="8"
            :rules="[$validationRules.isRequired]"
            :error-message="errors.password?.[0]"
            :error="!!errors.password?.length"
          />
          <QInput
            label="Neuer Benutzer*innenname"
            v-model="newUsername"
            :rules="[$validationRules.isRequired]"
            :error-message="errors.new_username?.[0]"
            :error="!!errors.new_username?.length"
          />
        </QCardSection>
        <QCardActions align="right">
          <QBtn flat :disabled="isSubmitting" color="primary" label="Abbrechen" @click="onDialogHide" />
          <QBtn flat :disabled="isSubmitting" color="primary" label="OK" type="submit" />
        </QCardActions>

      </QForm>
    </QCard>
  </QDialog>
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QForm, QInput, QToolbar, QToolbarTitle } from 'quasar'
import PasswordInput from 'components/PasswordInput.vue'

export default defineComponent({
  name: 'ChangeUsernameDialog',
  components: {
    PasswordInput,
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
    'ok', 'hide'
  ],
  data() {
    return {
      newUsername: '',
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
        await this.$apiClient.account.changeUsername({
          password: this.password,
          new_username: this.newUsername
        })
        this.$q.notify({
          message: 'Benutzer*innenname wurde geändert',
          color: 'positive'
        })
        this.$emit('ok', this.newUsername)
        this.$emit('hide')
      } catch (e) {
        if (this.$apiClient.isApiClientError(e) && e.response?.status === 400) {
          this.errors = e.response.data
        }
        this.$q.notify({
          message: 'Etwas ging schief beim Ändern des Benutzer*innenname',
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
