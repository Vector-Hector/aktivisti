import { computed } from 'vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { useEventStore } from 'src/stores/event'
import { useRouter } from 'vue-router'

export function useEventDetailPosterMixin() {
  const $router = useRouter()
  const eventStore = useEventStore()
  const poster = computed({
    get: () => {
      return eventStore.postersInArea[eventStore.activePosterIndex!]
    },
    set: (poster: Partial<PosterDto>) => {
      eventStore.mergePosters([poster as PosterDto])
    }
  })

  const selectPoster = (posterId: number, replace = false) => {
    void $router.push({
      name: 'event-detail-poster-detail',
      params: {
        posterId: posterId
      },
      replace
    })
  }

  return { poster, selectPoster }
}
