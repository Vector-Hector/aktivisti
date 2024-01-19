<script setup lang="ts">
import { ref } from 'vue'

import { UserRegistrationDto } from 'src/api/model/UserRegistrationDto'
import { QBtn, QForm, QInput, QPage, QScrollArea, useQuasar } from 'quasar'
import FormError from 'components/FormError.vue'
import { configStore } from 'src/store/ConfigStore'
import PasswordInput from 'components/PasswordInput.vue'
import { apiClient } from 'src/api/ApiClient'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const $router = useRouter()

const registrationData = ref<Partial<UserRegistrationDto>>({})
const errors = ref<any>({})
const submitting = ref(false)

if (configStore.getState().service_config.registration_disabled) {
  $q.dialog({
    title: 'Geschlossene Beta',
    message:
      'Schön, dass du dich für die LINKE Wahlkampf-App interessierst. Derzeit befinden wir uns in einer ' +
      'geschlossenen Beta-Phase. Registrierungen sind erst ab der nächsten Phase möglich. ' +
      'Um jetzt schon mitzumachen, muss eine Genoss*in dich einladen.'
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
          non_field_error: 'Diese Funktion steht derzeit nicht zur Verfügung'
        }
      }
    } else {
      errors.value = {
        non_field_error: 'Ein unerwarteter Fehler ist aufgetreten'
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
            :rules="[$validationRules.isRequired, $validationRules.email]"
            name="email"
            label="E-Mailadresse *"
            :error-message="errors.email?.[0]"
            :error="!!errors.email?.length"
          />
          <QInput
            v-model="registrationData.username"
            :rules="[$validationRules.isRequired]"
            name="username"
            label="Benutzer*innenname *"
            :error-message="errors.username?.[0]"
            :error="!!errors.username?.length"
          />
          <PasswordInput
            v-model="registrationData.password"
            :rules="[$validationRules.isRequired]"
            name="password"
            label="Passwort *"
            :minlength="6"
            :error-message="errors.password?.[0]"
            :error="!!errors.password?.length"
          />
          <QInput
            v-model="registrationData.plz"
            :rules="[$validationRules.isRequired]"
            :maxlength="5"
            :minlength="5"
            label="Postleitzahl *"
            name="plz"
            :error-message="errors.plz?.[0]"
            :error="!!errors.plz?.length"
          />
          <QInput
            v-model="registrationData.first_name"
            name="first_name"
            label="Vorname"
            :error-message="errors.first_name?.[0]"
            :error="!!errors.first_name?.length"
          />
          <QInput
            v-model="registrationData.last_name"
            name="last_name"
            label="Nachname"
            :error-message="errors.last_name?.[0]"
            :error="!!errors.last_name?.length"
          />

          <div class="privacy-disclaimer">
            <p>
              Als Benutzer*in der LINKEN App nimmst Du zur Kenntnis und stimmst
              zu, dass Du die per App erhaltenen und übermittelten Daten zu
              keinem anderen Zweck als der Organisation von Aktionen der Partei
              DIE LINKE nutzt, insbesondere diese weder speicherst, noch
              kopierst oder Dritten für andere Zwecke übermittelst. Du stimmst
              zu, dass Passwort stets vertraulich zu behandeln und jeden Verlust
              des Gerätes oder jede mögliche Offenbarung des Passwortes oder
              zweckwidrige Nutzung der App durch Dritte unverzüglich dem
              Bundesvorstand unter
              <a href="mailto:datenschutz@die-linke.app" class="primary-link"
                >datenschutz@die-linke.app</a
              >
              mitzuteilen. Du stimmst zu, jede Nachfrage Dritter zum Umfang der
              Datenverarbeitung der App an den Verantwortlichen beim
              Bundesvorstand der Partei weiterzuleiten und dem Betroffenen die
              Kontaktdaten bzw. den Link zu den
              <a
                href="https://www.die-linke.de/seitenfuss/datenschutz/#accordion-heading-17445-2912"
                target="_blank"
                class="primary-link"
              >
                Datenschutzhinweisen
              </a>
              mitzuteilen.
            </p>
          </div>
          <FormError :error="errors.non_field_error?.[0]" />
          <div class="control-buttons">
            <QBtn color="primary" type="submit" :disabled="submitting">
              Registrieren
            </QBtn>
          </div>
        </QForm>

        <div class="sign-up-link">
          Du bist bereits angemeldet?
          <router-link to="/login" class="primary-link">
            Zum Login
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
