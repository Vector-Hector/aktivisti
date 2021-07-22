import { defineComponent } from 'vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { posterListStore } from 'src/store/PosterListStore'

export default defineComponent({
  name: 'EventDetailPosterMixin',
  computed: {
    posters: {
      get() {
        return posterListStore.state.posters
      },
      set(posters: PosterDto[]) {
        posterListStore.state.posters = posters
      }
    },
    activePosterIndex: {
      get() {
        return posterListStore.state.activePosterIndex
      },
      set(index: number) {
        posterListStore.state.activePosterIndex = index
      }
    }
  },
  methods: {
    selectPoster(posterId: number) {
      void this.$router.push({
        name: 'event-detail-poster-detail',
        params: {
          posterId: posterId
        }
      })
    }
  }
})
