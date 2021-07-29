<template>
  <div class="flex column full-width">
    <div class="container q-py-sm col-grow full-width">
      <EditPoster
        :key="poster.id"
        v-if="poster"
        v-model:poster="poster"
      />
      <div class="row">
        <div class="col-grow d-flex justify-center">
          <QBtn
            v-if="event.poster_creation_allowed"
            class="delete-button"
            flat
            :icon="ionTrash"
            label="Löschen"
            color="primary"
            @click="onDeleteClicked"
          />
        </div>
      </div>
    </div>
    <SidebarBottomBackNavigation
      @back="$router.go(-1)"
    />
  </div>
</template>
<script lang="ts">
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent } from 'vue'
import EditPoster from 'components/EditPoster.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { cloneDeep, isEqual } from 'lodash-es'
import { SettleDebouncer } from 'src/utils/debounce'
import { eventDetailStore } from 'src/store/EventDetailStore'
import { RouteLocation, NavigationGuardNext } from 'vue-router'
import { ionTrash } from '@quasar/extras/ionicons-v5'
import { QBtn } from 'quasar'
import { uiStore } from 'src/store/UiStore'
import SidebarBottomBackNavigation from 'components/SidebarBottomBackNavigation.vue'

function updateRoute(to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) {
  const {posterId, areaId} = to.params
  const parsedAreaId = areaId !== 'undefined' ? parseInt(areaId.toString()) : null

  const postersInArea = eventDetailStore.state.posters.filter(({area}) => area === parsedAreaId)
  const posterIndex = postersInArea.findIndex(
    (({id}) => parseInt(posterId as string) === id)
  )
  if (posterIndex > -1) {
    eventDetailStore.state.activePosterIndex = posterIndex
    uiStore.updateActiveElements({
      poster: `Plakat #${postersInArea[posterIndex]?.poster_id}`
    })
    next()
  } else {
    // poster not found
    eventDetailStore.state.activePosterIndex = null
    next({
      name: 'event-detail-poster-list',
      params: {
        eventId: to.params.eventId,
        areaId: to.params.areaId
      }
    })
  }
}

export default defineComponent({
  name: 'EventDetailPosterDetail',
  components: {SidebarBottomBackNavigation, EditPoster, QBtn},
  mixins: [EventDetailPosterMixin],
  beforeRouteEnter: updateRoute,
  beforeRouteUpdate: updateRoute,
  beforeRouteLeave() {
    eventDetailStore.state.activePosterIndex = null
  },
  data() {
    return {
      ionTrash,
      saveDebouncer: new SettleDebouncer()
    }
  },
  computed: {
    posterCopy(): PosterDto {
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
    onDeleteClicked() {
      this.$q.dialog({
        title: 'Plakat löschen',
        message: `Möchtest du das Plakat #${this.poster.poster_id} wirklich löschen?`,
        cancel: true
      }).onOk(async () => {
        try {
          await this.$apiClient.posters.delete(this.poster.id.toString())
          this.$q.notify({
            color: 'neutral',
            message: 'Plakat wurde gelöscht'
          })
          const posterId = this.poster.id
          await this.$router.replace({name: 'event-detail-poster-list'})
          this.deletePostersByIds([posterId])
        } catch (e) {
          this.$q.notify({
            color: 'negative',
            message: 'Beim Löschen des Plakats trat ein Fehler auf'
          })
        }
      })

    },
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
            message: 'Das Plakat wurde gespeichert'
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
<style lang="scss" scoped>

</style>
