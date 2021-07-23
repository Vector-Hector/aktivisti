<template>
  <EditPoster
    :key="poster.id"
    v-if="poster"
    v-model:poster="poster"
  />
</template>
<script lang="ts">
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent } from 'vue'
import EditPoster from 'components/EditPoster.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { cloneDeep, isEqual } from 'lodash-es'
import { SettleDebouncer } from 'src/utils/debounce'
import { eventDetailStore } from 'src/store/EventDetailStore'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailPosterDetail',
  components: {EditPoster},
  mixins: [EventDetailPosterMixin, EventDetailStoreMixin],
  beforeRouteEnter(to, from, next) {
    const {posterId, areaId} = to.params
    const parsedAreaId = areaId !== 'undefined' ? parseInt(areaId.toString()) : null
    const postersInArea = eventDetailStore.state.posters.filter(({area}) => area === parsedAreaId)
    eventDetailStore.state.activePosterIndex = postersInArea.findIndex(
      (({id}) => parseInt(posterId as string) === id)
    )

    next()
  },
  beforeRouteUpdate(to, from, next) {
    const {posterId, areaId} = to.params
    const parsedAreaId = areaId !== 'undefined' ? parseInt(areaId.toString()) : null
    const postersInArea = eventDetailStore.state.posters.filter(({area}) => area === parsedAreaId)
    eventDetailStore.state.activePosterIndex = postersInArea.findIndex(
      (({id}) => parseInt(posterId as string) === id)
    )
    next()
  },
  beforeRouteLeave() {
    eventDetailStore.state.activePosterIndex = null
  },
  data() {
    return {
      saveDebouncer: new SettleDebouncer()
    }
  },
  computed: {
    poster: {
      get(): PosterDto {
        return this.postersInArea[eventDetailStore.state.activePosterIndex!]
      },
      set(poster: Partial<PosterDto>) {
        this.mergePosters([poster as PosterDto])
      }
    },
    posterCopy() {
      return cloneDeep(this.poster)
    }
  },
  watch: {
    posterCopy: {
      handler(newValue: PosterDto, oldValue: PosterDto) {
        if (!newValue) return
        // trigger save if the poster has changed and is the same id as before
        if (newValue?.id === oldValue?.id && !isEqual(newValue, oldValue)) {
          void this.save()
        }
      },
      deep: true
    }
  },
  methods: {
    async save() {
      const posterToSave = {...this.poster}
      await this.saveDebouncer.executeDebounced(async () => {
        try {
          await this.$apiClient.posters.patch(posterToSave.id.toString(), {
            status: posterToSave.status,
            mounted_on: posterToSave.mounted_on
          })
          this.$q.notify({
            color: 'positive',
            message: 'Das Poster wurde gespeichert'
          })
        } catch (e) {
          this.$q.notify({
            color: 'negative',
            message: 'Beim Speichern trat ein Fehler auf'
          })
        }
      })
    }
  }
})
</script>
<style>

</style>
