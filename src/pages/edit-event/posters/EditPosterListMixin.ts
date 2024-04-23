import { computed } from 'vue'
import { posterListStore } from 'src/store/PosterListStore'
import { PosterDto } from 'src/api/model/PosterDto'
import { apiClient } from 'src/api/ApiClient'
import { useQuasar } from 'quasar'

export function useEditPosterListMixin() {
  const $q = useQuasar()
  const posters = computed({
    get(): Partial<PosterDto>[] {
      return posterListStore.state.posters
    },
    set(posters: Partial<PosterDto>[]) {
      posterListStore.state.posters = posters
    }
  })

  const activePosterIndex = computed({
    get(): number | null {
      return posterListStore.state.activePosterIndex
    },
    set(index: number | null) {
      posterListStore.state.activePosterIndex = index
    }
  })

  const deletePoster = async (poster: PosterDto) => {
    try {
      await apiClient.posters.delete(poster.id.toString())
      posters.value = posters.value.filter(({ id }) => id !== poster.id)
    } catch (e) {
      $q.notify({
        color: 'negative',
        message: 'Beim löschen des Posters ist ein Fehler aufgetreten'
      })
    }
  }

  return { posters, activePosterIndex, deletePoster }
}
