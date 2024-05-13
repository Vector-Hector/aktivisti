import { computed } from 'vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { useRouter } from 'vue-router'

export function useEventDetailPosterMixin() {
  const $router = useRouter()
  const { postersInArea, mergePosters } = useEventDetailStore()
  const poster = computed({
    get: () => {
      return postersInArea.value[eventDetailStore.state.activePosterIndex!]
    },
    set: (poster: Partial<PosterDto>) => {
      mergePosters([poster as PosterDto])
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
