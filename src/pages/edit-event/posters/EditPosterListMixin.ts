import { defineComponent } from 'vue'
import { posterListStore } from 'src/store/PosterListStore'
import { PosterDto } from 'src/api/model/PosterDto'


export default defineComponent({
  name: 'EditPosterListMixin',
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
    async deletePoster(poster: PosterDto) {
      try {
        await this.$apiClient.posters.delete(poster.id.toString())
        this.posters = this.posters.filter(({id}) => id !== poster.id)
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          message: 'Beim löschen des Posters ist ein Fehler aufgetreten'
        })
      }
    }
  }
})
