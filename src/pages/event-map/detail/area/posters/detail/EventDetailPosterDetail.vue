<template>
  <EditPoster
    v-if="poster"
    v-model:poster="poster"
  />
</template>
<script lang="ts">
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent } from 'vue'
import { posterListStore } from 'src/store/PosterListStore'
import EditPoster from 'components/EditPoster.vue'
import { PosterDto } from 'src/api/model/PosterDto'

export default defineComponent({
  name: 'EventDetailPosterDetail',
  components: {EditPoster},
  mixins: [EventDetailPosterMixin],
  beforeRouteEnter(to, from, next) {
    const {posterId} = to.params
    posterListStore.state.activePosterIndex = posterListStore.state.posters.findIndex((({id}) => parseInt(posterId) === id))
    next()
  },
  beforeRouteUpdate(to, from, next) {
    const {posterId} = to.params
    posterListStore.state.activePosterIndex = posterListStore.state.posters.findIndex((({id}) => parseInt(posterId) === id))
    next()
  },
  beforeRouteLeave() {
    posterListStore.state.activePosterIndex = null
  },
  computed: {
    poster: {
      set(poster: Partial<PosterDto>) {
        posterListStore.state.posters[posterListStore.state.activePosterIndex!] = poster
      },
      get() {
        return posterListStore.state.posters[posterListStore.state.activePosterIndex!]
      }
    }
  }
})
</script>
<style>

</style>
