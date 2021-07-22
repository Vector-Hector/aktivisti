<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import { posterListStore } from 'src/store/PosterListStore'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'

export default defineComponent({
  name: 'EditEventPosters',
  mixins: [EditPosterListMixin],
  async beforeRouteEnter(to, from, next) {
    const posters = await apiClient.posters.list({event: to.params.eventId})
    posterListStore.state.posters = posters.payload.data
    next()
  },
  beforeRouteLeave() {
    posterListStore.reset()
  }
})
</script>

<style lang="scss" scoped>

</style>
