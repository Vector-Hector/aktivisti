import { PosterDto } from 'src/api/model/PosterDto'
import { defineComponent } from 'vue'
import { editPosterListStore } from 'src/store/EditPosterListStore'

export default defineComponent({
  computed: {
    poster: {
      set(poster: Partial<PosterDto>) {
        editPosterListStore.state.posters[editPosterListStore.state.activePosterIndex!] = poster
      },
      get() {
        return editPosterListStore.state.posters[editPosterListStore.state.activePosterIndex!]
      }
    }
  }
})
