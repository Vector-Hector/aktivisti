<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { QBadge } from 'quasar'
import { myParticipationsStore } from 'src/store/MyParticipationsStore'
import { useUserStore } from 'src/stores/user'
import Timeout = NodeJS.Timeout
import { apiClient } from 'src/api/ApiClient'
import { POLL_INVITATIONS_MS } from 'src/constants'
import { getAuthStore } from 'src/store/AuthStore'
import { EventStatus } from 'src/api/model/EventStatus'

const authStore = getAuthStore()
const userStore = useUserStore()
const nextPoll = ref<Timeout | null>(null)

onMounted(async () => {
  const myEventsRequest = await apiClient.eventParticipations.list({
    user: userStore.user?.id
  })

  myParticipationsStore.setEventParticipations(myEventsRequest.payload.data)
  await pollForParticipations()
})

onUnmounted(() => {
  if (nextPoll.value !== null) {
    clearTimeout(nextPoll.value)
  }
})

const isLoggedIn = computed(() => {
  return authStore.isLoggedIn()
})
const openInvitations = computed(() => {
  if (isLoggedIn.value) {
    return myParticipationsStore
      .getState()
      .eventParticipations.filter((item) => item.is_pending_invitation)
  } else {
    return []
  }
})
async function pollForParticipations() {
  myParticipationsStore.setEventParticipations(
    (
      await apiClient.eventParticipations.list({
        user: userStore.user?.id,
        status: EventStatus.ACTIVE
      })
    ).payload.data
  )

  nextPoll.value = setTimeout(
    () => void pollForParticipations(),
    POLL_INVITATIONS_MS
  )
}
</script>
<template>
  <div v-if="openInvitations.length > 0">
    <QBadge
      color="primary"
      text-color="white"
      :label="openInvitations.length"
    />
  </div>
</template>

<style scoped></style>
