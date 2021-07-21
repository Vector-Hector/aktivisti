<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { apiClient } from 'src/api/ApiClient'
import { editPosterListStore } from 'src/store/EditPosterListStore'
import EditPosterListMixin from 'pages/edit-event/posters/EditPosterListMixin'

export default defineComponent({
  name: 'EditEventPosters',
  mixins: [EditPosterListMixin],
  async beforeRouteEnter(to, from, next) {
    const posters = await apiClient.posters.list({event: to.params.eventId})
    editPosterListStore.state.posters = posters.payload.data
    next()
  },
  beforeRouteLeave() {
    editPosterListStore.reset()
  }
})
</script>

<style lang="scss" scoped>

</style>
