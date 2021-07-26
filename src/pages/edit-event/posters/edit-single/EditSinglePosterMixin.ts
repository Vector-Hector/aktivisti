import { PosterDto } from 'src/api/model/PosterDto'
import { defineComponent } from 'vue'
import { posterListStore } from 'src/store/PosterListStore'

export default defineComponent({
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
