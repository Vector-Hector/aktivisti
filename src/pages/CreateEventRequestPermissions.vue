<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { QBtn, QInput, QPage, QScrollArea, useQuasar } from 'quasar'
import { userStore } from 'src/store/UserStore'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import MultipleSubAssociationFilter from 'components/filterInput/filters/MultipleSubAssociationFilter.vue'
import { UserDto } from 'src/api/model/UserDto'
import { apiClient } from 'src/api/ApiClient'

const $q = useQuasar()

const message = ref<string>('')
const localUser = ref<UserDto | null>(cloneDeep(userStore.getState().user))
const errors = ref<any>({})
const subAssociations = ref<SubAssociationDto[]>([])
const selectedSubAssociation = ref<number>(0)

onMounted(async () => {
  await getSubAssociations()
  const homeAssociation = userStore.getState().homeAssociation
  selectedSubAssociation.value = homeAssociation ? homeAssociation.id : 0
})

async function getSubAssociations() {
  subAssociations.value = (await apiClient.subAssociations.list()).payload.data
}
async function requestCoordinatorPermissions() {
  try {
    await apiClient.contact.post({
      message: message.value,
      sub_association: selectedSubAssociation.value
    })
    $q.notify({
      color: 'positive',
      message: 'Vielen Dank für deine Nachricht. Wir melden uns bald bei dir.'
    })
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response.data
      $q.notify({
        message:
          'Deine Nachricht konnte nicht versendet werden, bitte prüfe deine Angaben.',
        color: 'negative'
      })
    } else {
      $q.notify({
        color: 'negative',
        message: 'Ein unerwarteter Fehler ist aufgetreten'
      })
    }
  }
}
</script>
<template>
  <QScrollArea class="d-flex flex-fill">
    <QPage>
      <div class="container">
        <p class="description-text">
          Du willst eine Aktion in Deinem Kreisverband planen und andere dazu
          einladen? Dann brauchst Du Koordination-Rechte. Schreibe uns kurz, was
          Du für Veranstaltungen planen willst - wir melden uns bei Dir.
        </p>
        <QInput
          stack-label
          disable
          v-model="localUser.username"
          label="Benutzer*innenname"
        />
        <QInput stack-label disable v-model="localUser.email" label="E-Mail" />
        <MultipleSubAssociationFilter
          v-model="selectedSubAssociation"
          :multiple="false"
          :options="subAssociations"
          :error="!!errors.sub_association?.length"
          :error-message="errors.sub_association?.[0]"
        />
        <QInput
          stack-label
          type="textarea"
          v-model="message"
          label="Deine Nachricht"
          :error="!!errors.message?.length"
          :error-message="errors.message?.[0]"
        />
        <QBtn
          label="Koordinationsrechte beantragen"
          color="negative"
          @click="requestCoordinatorPermissions"
        />
      </div>
    </QPage>
  </QScrollArea>
</template>
<style lang="scss" scoped>
.description-text {
  color: $text-primary;
  font-size: 1rem;
  padding: 1rem 2rem 1rem 0;
  line-height: 1;
  display: block;
}
</style>
