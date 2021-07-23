import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EventDetailPosterMixin',
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
