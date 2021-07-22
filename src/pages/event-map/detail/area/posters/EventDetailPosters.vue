<template>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { posterListStore } from 'src/store/PosterListStore'
import { apiClient } from 'src/api/ApiClient'

export default defineComponent({
  name: 'EventDetailPosters',
  async beforeRouteEnter(to, from, next) {
    posterListStore.state.posters = (
      await apiClient.posters.list({event: to.params.eventId, area: to.params.areaId})
    ).payload.data
    next()
  },
  beforeRouteLeave() {
    posterListStore.reset()
  }
})
</script>
