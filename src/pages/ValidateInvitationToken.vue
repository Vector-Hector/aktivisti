<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QSpinnerDots, useQuasar } from 'quasar'
import { apiClient } from 'src/api/ApiClient'
import { useI18n } from 'vue-i18n'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'

const route = useRoute()
const $router = useRouter()
const $q = useQuasar()
const { t } = useI18n()

const token = computed(() => {
  const token = route.params.token
  return Array.isArray(token) ? token[0] : token
})

const isLoading = ref(true)
const isValid = ref(false)
const participation = ref<EventParticipationDto>(null)

onMounted(async () => {
  try {
    participation.value = (
      await apiClient.events.validateInvitationToken({
        token: token.value
      })
    ).payload.data

    await apiClient.events.get(participation.value.event.toString())

    isValid.value = true
  } catch (error) {
    void error
    isValid.value = false
  } finally {
    $q.notify({
      color: isValid.value ? 'positive' : 'negative',
      message: isValid.value
        ? t('events.invitationToken.notifications.success')
        : t('events.invitationToken.notifications.error')
    })
    const nextRoute = isValid.value
      ? {
          name: 'event-detail',
          params: {
            eventId: participation.value.event
          }
        }
      : { name: 'events' }
    isLoading.value = false
    void $router.replace(nextRoute)
  }
})
</script>

<template>
  <div v-if="isLoading" class="justify-center q-my-md">
    <QSpinnerDots color="primary" size="40px" />
  </div>
</template>

<style scoped>
.q-my-md {
  margin: auto;
}
</style>
