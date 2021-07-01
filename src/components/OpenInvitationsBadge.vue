<template>
  <div v-if="openInvitations.length > 0">
    <QBadge :color="primary" :text-color="white" :label="openInvitations.length"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QBadge } from 'quasar'
import { myEventsStore } from 'src/store/MyEventsStore'
import { userStore } from 'src/store/UserStore'
import Timeout = NodeJS.Timeout;
import { apiClient } from 'src/api/ApiClient'
import { POLL_INVITATIONS_MS } from 'src/constants'
import { EventParticipationDto } from 'src/api/model/EventParticipationDto'
import { authStore } from 'src/store/AuthStore'


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

    myEventsStore.setEventParticipations(myEventsRequest.payload.data)
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
        const openInvitations = myEventsStore.getState().eventParticipations.filter((item) => item.is_pending_invitation)
        console.log('OpenInvitations:', openInvitations)
        return openInvitations
      }
      else {
        return []
      }
    }

  },
  methods: {
    async pollForParticipations() {
      myEventsStore.setEventParticipations(
        (await this.$apiClient.eventParticipations.list({user: userStore.getState().user?.id})).payload.data
      )

      this.nextPoll = setTimeout(() => void this.pollForParticipations(), POLL_INVITATIONS_MS)
    }
  }
})
</script>

<style scoped>

</style>
