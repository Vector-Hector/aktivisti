import { defineComponent } from 'vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { eventDetailStore } from 'src/store/EventDetailStore'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailPosterMixin',
  mixins: [EventDetailStoreMixin],
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
