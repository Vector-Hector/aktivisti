<template>
  <QBadge :color="primary" :text-color="white" :label="openInvitationsCount"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { QBadge } from 'quasar'
import { myEventsStore } from 'src/store/MyEventsStore'
import { userStore } from 'src/store/UserStore'
import Timeout = NodeJS.Timeout;


export default defineComponent({
  name: 'OpenInvitationsBadge',
  components: {
    QBadge
  },
  props: ['openInvitationsCount'],
  data() {
   return {
      nextPoll: null as Timeout | null
    }
  },
  async created() {
    await this.pollForParticipations()
  },
  unmounted() {
    if (this.nextPoll !== null) {
      clearTimeout(this.nextPoll)
    }
  },
  methods: {
    async pollForParticipations() {
      myEventsStore.setEventParticipations(
        (await this.$apiClient.eventParticipations.list({user: userStore.getState().user?.id})).payload.data
      )

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.nextPoll = setTimeout(() => this.pollForParticipations(), 5000)
    }
  }
})
</script>

<style scoped>

</style>
