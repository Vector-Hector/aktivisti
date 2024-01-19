<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
// If a poster is not assigned to an event area, the event area is 'undefined'
// e.g. a path /event/<event_id>/area/undefined/... will show all posters that
// are not assigned to an area.
export const UNDEFINED_POSTER_AREA = 'undefined'

function updateRoute(
  to: RouteLocation,
  from: RouteLocation,
  next: NavigationGuardNext
) {
  const { posterId, areaId } = to.params
  const parsedAreaId =
    areaId !== UNDEFINED_POSTER_AREA ? parseInt(areaId.toString()) : null

  const postersInArea = eventDetailStore.state.posters.filter(
    ({ area }) => area === parsedAreaId
  )
  const posterIndex = postersInArea.findIndex(
    ({ id }) => parseInt(posterId as string) === id
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
  beforeRouteEnter: updateRoute
})
</script>

<script setup lang="ts">
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { computed, defineComponent, watch } from 'vue'
import EditPoster from 'components/EditPoster.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { cloneDeep, isEqual } from 'lodash-es'
import { SettleDebouncer } from 'src/utils/debounce'
import { eventDetailStore } from 'src/store/EventDetailStore'
import {
  RouteLocation,
  NavigationGuardNext,
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  useRouter
} from 'vue-router'
import { ionTrash } from '@quasar/extras/ionicons-v5'
import { QBtn, useQuasar } from 'quasar'
import { uiStore } from 'src/store/UiStore'
import SidebarBottomBackNavigation from 'components/SidebarBottomBackNavigation.vue'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { apiClient } from 'src/api/ApiClient'

const $q = useQuasar()
const $router = useRouter()
const { event, deletePostersByIds } = useEventDetailStore()
const { poster } = useEventDetailPosterMixin()

onBeforeRouteUpdate(updateRoute)
onBeforeRouteLeave(() => {
  eventDetailStore.state.activePosterIndex = null
})

const saveDebouncer = new SettleDebouncer()

const posterCopy = computed(() => {
  return cloneDeep(poster.value)
})

watch(
  posterCopy,
  (newValue: PosterDto, oldValue: PosterDto) => {
    if (!newValue) return
    // trigger save if the poster has changed and is the same id as before
    if (newValue?.id === oldValue?.id && !isEqual(newValue, oldValue)) {
      void save()
    }
  },
  { deep: true }
)

function onDeleteClicked() {
  $q.dialog({
    title: 'Plakat löschen',
    message: `Möchtest du das Plakat #${poster.value.poster_id} wirklich löschen?`,
    cancel: true
  })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .onOk(async () => {
      try {
        await apiClient.posters.delete(poster.value.id.toString())
        $q.notify({
          color: 'neutral',
          message: 'Plakat wurde gelöscht'
        })
        const posterId = poster.value.id
        await $router.replace({ name: 'event-detail-poster-list' })
        deletePostersByIds([posterId])
      } catch (e) {
        $q.notify({
          color: 'negative',
          message: 'Beim Löschen des Plakats trat ein Fehler auf'
        })
      }
    })
}
async function save() {
  const posterToSave = { ...poster.value }
  await saveDebouncer.executeDebounced(async () => {
    try {
      await apiClient.posters.patch(posterToSave.id.toString(), {
        status: posterToSave.status,
        mounted_on: posterToSave.mounted_on
      })
      $q.notify({
        color: 'positive',
        message: 'Das Plakat wurde gespeichert'
      })
    } catch (e) {
      $q.notify({
        color: 'negative',
        message: 'Beim Speichern trat ein Fehler auf'
      })
    }
  })
}
</script>
<template>
  <div class="flex column full-width">
    <div class="container q-py-sm col-grow full-width">
      <EditPoster :key="poster.id" v-if="poster" v-model:poster="poster" />
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
    <SidebarBottomBackNavigation @back="$router.go(-1)" />
  </div>
</template>
<style lang="scss" scoped></style>
