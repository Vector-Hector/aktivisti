import { defineComponent } from 'vue'
import { editPosterListStore } from 'src/store/EditPosterListStore'
import { PosterDto } from 'src/api/model/PosterDto'


export default defineComponent({
  name: 'EditPosterListMixin',
  computed: {
    posters: {
      get() {
        return editPosterListStore.state.posters
      },
      set(posters: PosterDto[]) {
        editPosterListStore.state.posters = posters
      }
    },
    activePosterIndex: {
      get() {
        return editPosterListStore.state.activePosterIndex
      },
      set(index: number) {
        editPosterListStore.state.activePosterIndex = index
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
