<script lang="ts">
interface IInstance extends ComponentPublicInstance {
  setpreviousBottomSheetState(value: BottomSheetState): void
}
export default {
  beforeRouteEnter(to, from, next) {
    if (
      !userStore.isTeamCaptainOrLocalCoordinator() &&
      !userStore.isAdminOrGlobalCoordinator()
    ) {
      ErrorBus.emit(
        NOT_AUTHORIZED,
        'Um einen Kontakt zu registrieren, benötigst du eine Teamcaptain- oder Koordinator*innen-Berechtigung'
      )
      next({ name: 'login' })
    } else {
      const previousBottomSheetState = uiStore.getState().bottomSheetState
      next((vm) => {
        // @ts-ignore
        ;(vm as IInstance).previousBottomSheetState = previousBottomSheetState
        uiStore.setBottomSheetStateAtLeast(BottomSheetState.EXPANDED)
      })
    }
  }
}
</script>
<script setup lang="ts">
import { ComponentPublicInstance, ref } from 'vue'
import { LeadDto } from 'src/api/model/LeadDto'
import {
  QBtn,
  QCard,
  QCheckbox,
  QDialog,
  QForm,
  QInput,
  QPage,
  QScrollArea,
  QSelect,
  QToolbar,
  QToolbarTitle
} from 'quasar'
import FormError from 'components/FormError.vue'
import { ionClose } from '@quasar/extras/ionicons-v5'
import { BottomSheetState, uiStore } from 'src/store/UiStore'
import { userStore } from 'src/store/UserStore'
import { ErrorBus, NOT_AUTHORIZED } from 'src/utils/errorBus'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { apiClient } from 'src/api/ApiClient'

interface Props {
  areaId?: string
}
const props = defineProps<Props>()

const $router = useRouter()
const form = ref<InstanceType<typeof QForm> | null>(null)

const previousBottomSheetState = ref(BottomSheetState.HALF)
const qrCodeOpen = ref(false)
const lead = ref<Partial<LeadDto>>({
  is_party_member: false,
  want_to_become_member: false
})
const isSubmitting = ref(false)
const errors = ref<any>({})
const genders = [
  {
    value: 'm',
    label: 'männlich'
  },
  {
    value: 'w',
    label: 'weiblich'
  },
  {
    value: 'd',
    label: 'divers'
  }
]

onBeforeRouteLeave(() => {
  uiStore.setBottomSheetState(previousBottomSheetState.value)
})

async function saveLead() {
  isSubmitting.value = true
  errors.value = {}
  try {
    await apiClient.leads.create({
      ...lead.value,
      event_area: props.areaId ? parseInt(props.areaId) : undefined,
      // The form will register the lead on the behalf of someone else - therefor a double opt in is necessary
      // The first opt in here is implicit by offering the data in a person to person talk at the door
      privacy_opt_in: true
    })
    // TODO: maybe add an explicit back route
    lead.value = {
      is_party_member: false,
      want_to_become_member: false
    }
    form.value?.reset()
    $router.go(-1)
  } catch (error) {
    if (apiClient.isApiClientError(error) && error.response?.status === 400) {
      errors.value = error.response.data
    } else {
      errors.value = {
        non_field_error: ['Ein unerwarteter Fehler ist aufgetreten']
      }
    }
  }
  isSubmitting.value = false
}
function openQRCode() {
  qrCodeOpen.value = true
}
</script>

<template>
  <QPage class="flex-fill">
    <div class="container create-leads">
      <QScrollArea class="flex-fill d-flex">
        <div class="q-px-md q-pb-md">
          <QDialog v-model="qrCodeOpen">
            <QCard>
              <QToolbar>
                <QToolbarTitle>QR Code zu Linksaktiv</QToolbarTitle>
                <QBtn flat round dense :icon="ionClose" v-close-popup />
              </QToolbar>

              <div class="qr-container">
                <img
                  src="../assets/img/create-lead-qr.png"
                  alt="QR Code mit Link zu Linksaktiv"
                />
              </div>
            </QCard>
          </QDialog>
          <div class="qr-link">
            <QBtn
              flat
              color="primary"
              label="QR-Link zu diesem Formular"
              small
              @click="openQRCode"
            >
              <img
                class="qr-link-image"
                src="../assets/img/create-lead-qr.png"
                alt="QR Code zum Linksaktiv-Formular"
              />
            </QBtn>
          </div>
          <QForm ref="form" @submit="saveLead">
            <QSelect
              label="Geschlecht *"
              v-model="lead.gender"
              emit-value
              :rules="[$validationRules.isRequired]"
              :options="genders"
              option-value="value"
              option-label="label"
              :display-value="
                genders.find(({ value }) => value === lead.gender)?.label
              "
              :error-message="errors.gender?.[0]"
              :error="!!errors.gender?.length"
            />
            <QInput
              label="Nachname *"
              v-model="lead.last_name"
              :rules="[$validationRules.isRequired]"
              :error-message="errors.last_name?.[0]"
              :error="!!errors.last_name?.length"
            />
            <QInput
              label="Vorname *"
              v-model="lead.first_name"
              :rules="[$validationRules.isRequired]"
              :error-message="errors.first_name?.[0]"
              :error="!!errors.first_name?.length"
            />
            <QInput
              label="E-Mail *"
              v-model="lead.email"
              :rules="[$validationRules.isRequired, $validationRules.email]"
              :error-message="errors.email?.[0]"
              :error="!!errors.email?.length"
            />
            <QInput
              label="Telefonnummer"
              v-model="lead.phone_number"
              :error-message="errors.phone_number?.[0]"
              :error="!!errors.phone_number?.length"
            />
            <QInput
              label="Postleitzahl *"
              v-model="lead.plz"
              :minlength="5"
              :maxlength="5"
              :rules="[$validationRules.isRequired]"
              :error-message="errors.plz?.[0]"
              :error="!!errors.plz?.length"
            />

            <QInput
              label="Stadt"
              v-model="lead.city"
              :error-message="errors.city?.[0]"
              :error="!!errors.city?.length"
            />

            <QCheckbox
              label="Ich bin Die Linke-Mitglied"
              v-model="lead.is_party_member"
            />
            <QCheckbox
              label="Ich möchte Die Linke-Mitglied werden"
              v-model="lead.want_to_become_member"
            />
            <div class="control-buttons">
              <FormError :error="errors.non_field_error" />
              <QBtn color="primary" type="submit" :disabled="isSubmitting">
                Abschicken
              </QBtn>
            </div>
          </QForm>
        </div>
      </QScrollArea>
    </div>
  </QPage>
</template>

<style lang="scss" scoped>
@import '../css/variables';

.create-leads {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.qr-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.qr-link-caption {
  color: $red;
  opacity: 0.7;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.qr-link-image {
  width: 1rem;
  height: 1rem;
  margin-left: 1rem;
}

.qr-container {
  width: 100%;
  height: 100%;

  img {
    width: 100%;
  }
}
</style>
