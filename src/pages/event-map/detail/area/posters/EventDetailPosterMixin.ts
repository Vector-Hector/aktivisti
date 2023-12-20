import { computed, defineComponent } from 'vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'EventDetailPosterMixin',
  setup() {
    const { postersInArea, mergePosters } = useEventDetailStore()
    return { postersInArea, mergePosters }
  },
  computed: {
    poster: {
      get(): PosterDto {
        return this.postersInArea[eventDetailStore.state.activePosterIndex!]
      },
      set(poster: Partial<PosterDto>) {
        this.mergePosters([poster as PosterDto])
      }
    }
  },
  methods: {
    selectPoster(posterId: number, replace = false) {
      void this.$router.push({
        name: 'event-detail-poster-detail',
        params: {
          posterId: posterId
        },
        replace
      })
    }
  }
})

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
