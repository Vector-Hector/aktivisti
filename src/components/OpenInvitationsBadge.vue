<template>
  <div v-if="openInvitations.length > 0">
    <QBadge color="primary" text-color="white" :label="openInvitations.length"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QBadge } from 'quasar'
import { myParticipationsStore } from 'src/store/MyParticipationsStore'
import { userStore } from 'src/store/UserStore'
import Timeout = NodeJS.Timeout;
import { apiClient } from 'src/api/ApiClient'
import { POLL_INVITATIONS_MS } from 'src/constants'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { getAuthStore } from 'src/store/AuthStore'
import { EventStatus } from 'src/api/model/EventStatus'

const authStore = getAuthStore()

export default defineComponent({
  name: 'OpenInvitationsBadge',
  components: {
    QBadge
  },
  data() {
   return {
      nextPoll: null as Timeout | null
    }
  },
  async created() {
    const myEventsRequest = await apiClient.eventParticipations.list(
      {user: userStore.getState().user?.id}
    )

    myParticipationsStore.setEventParticipations(myEventsRequest.payload.data)
    await this.pollForParticipations()
  },
  unmounted() {
    if (this.nextPoll !== null) {
      clearTimeout(this.nextPoll)
    }
  },
  computed :{
    isLoggedIn() {
      return authStore.isLoggedIn()
    },
    openInvitations(): EventParticipationDto[] {
      if (this.isLoggedIn) {
        return myParticipationsStore.getState().eventParticipations.filter((item) => item.is_pending_invitation)
      }
      else {
        return []
      }
    }

  },
  methods: {
    async pollForParticipations() {
      myParticipationsStore.setEventParticipations(
        (await this.$apiClient.eventParticipations.list({
          user: userStore.getState().user?.id,
          status: EventStatus.ACTIVE
        })).payload.data
      )

      this.nextPoll = setTimeout(() => void this.pollForParticipations(), POLL_INVITATIONS_MS)
    }
  }
})
</script>

<style scoped>

</style>
