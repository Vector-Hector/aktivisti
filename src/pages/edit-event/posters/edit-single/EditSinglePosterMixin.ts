import { PosterDto } from 'src/api/model/PosterDto'
import { computed } from 'vue'
import { posterListStore } from 'src/store/PosterListStore'

export function useEditSinglePosterMixin() {
  const poster = computed({
    get(): Partial<PosterDto> {
      return posterListStore.state.posters[
        posterListStore.state.activePosterIndex!
      ]
    },
    set(poster: Partial<PosterDto>) {
      posterListStore.state.posters[posterListStore.state.activePosterIndex!] =
        poster
    }
  })

  return { poster }
}
