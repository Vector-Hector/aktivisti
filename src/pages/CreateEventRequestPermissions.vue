<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { QBtn, QInput, QPage, QScrollArea, useQuasar } from 'quasar'
import { userStore } from 'src/store/UserStore'
import { SubAssociationDto } from 'src/api/model/SubAssociationDto'
import MultipleSubAssociationFilter from 'components/filterInput/filters/MultipleSubAssociationFilter.vue'
import { UserDto } from 'src/api/model/UserDto'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t } = useI18n()

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
      message: t('requestPermission.notifications.success')
    })
  } catch (e) {
    if (apiClient.isApiClientError(e) && e.response?.status === 400) {
      errors.value = e.response.data
      $q.notify({
        message: t('requestPermission.notifications.noValidDataError'),
        color: 'negative'
      })
    } else {
      $q.notify({
        color: 'negative',
        message: t('requestPermission.notifications.generalError')
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
          {{ $t('requestPermission.description') }}
        </p>
        <QInput
          stack-label
          disable
          v-model="localUser.username"
          :label="$t('requestPermission.username')"
        />
        <QInput
          stack-label
          disable
          v-model="localUser.email"
          :label="$t('requestPermission.email')"
        />
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
          :label="$t('requestPermission.message')"
          :error="!!errors.message?.length"
          :error-message="errors.message?.[0]"
        />
        <QBtn
          :label="$t('requestPermission.submitButton')"
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
