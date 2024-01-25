<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
export default {
  beforeRouteEnter: (to, from, next) => {
    uiStore.updateActiveElements({
      poster: `${uiStore.state.activeTitleElements.eventArea}: Plakate`
    })
    next()
  }
}
</script>
<script setup lang="ts">
import PosterTable from 'components/PosterTable.vue'
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import { QBtn, useQuasar } from 'quasar'
import SelectPosterLocation from 'components/modals/SelectPosterLocation.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { bbox, circle, point } from '@turf/turf'
import { userStore } from 'src/store/UserStore'
import { uiStore } from 'src/store/UiStore'
import {
  NavigationGuardNext,
  RouteLocation,
  onBeforeRouteUpdate,
  useRouter
} from 'vue-router'
import AssignAreaParticipants from 'pages/event-map/detail/area/AssignAreaParticipants.vue'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

function updateRoute(
  to: RouteLocation,
  from: RouteLocation,
  next: NavigationGuardNext
) {
  uiStore.updateActiveElements({
    poster: `${uiStore.state.activeTitleElements.eventArea}: Plakate`
  })
  next()
}

const $q = useQuasar()
const $router = useRouter()
const {
  event,
  eventArea,
  currentAreaFeature,
  posters,
  postersInArea,
  mergePosters
} = useEventDetailStore()
const { selectPoster } = useEventDetailPosterMixin()

onBeforeRouteUpdate(updateRoute)

function openCreatePosterDialog() {
  let initialBoundingBox =
    postersInArea.value.length > 0
      ? bbox({
          type: 'FeatureCollection',
          features: postersInArea.value.map(({ location }) =>
            circle(point([location.lng, location.lat]), 1)
          )
        })
      : null
  if (!initialBoundingBox) {
    initialBoundingBox = eventArea.value?.geometry
      ? bbox({
          type: 'Feature',
          geometry: eventArea.value.geometry
        })
      : null
  }
  if (!initialBoundingBox) {
    initialBoundingBox = userStore.state.bbox ?? null
  }
  $q.dialog({
    component: SelectPosterLocation,
    componentProps: {
      eventId: event.value.id,
      posters: posters.value,
      initialBBox: initialBoundingBox,
      areaFeatures: [currentAreaFeature.value]
    }
  }).onOk((poster: PosterDto) => {
    mergePosters([poster])
    if (poster.area !== eventArea.value.id) {
      $q.notify({
        color: 'warning',
        message:
          'Das neue Plakat wurde nicht im derzeit ausgewählten Gebiet platziert!'
      })
    }
    void $router.push({
      name: 'event-detail-poster-detail',
      params: {
        posterId: poster.id,
        areaId: poster.area ?? 'undefined'
      }
    })
  })
}
</script>

<template>
  <div class="container q-py-sm">
    <div class="row">
      <div class="col">
        <AssignAreaParticipants v-if="eventArea" />
      </div>
    </div>
    <div class="row q-py-sm">
      <div class="col-grow buttons">
        <QBtn
          v-if="event.poster_creation_allowed"
          color="primary"
          label="Erstellen"
          :icon="ionLocationSharp"
          @click="openCreatePosterDialog"
        />
      </div>
    </div>
    <PosterTable
      :posters="postersInArea"
      :show-actions="false"
      @row-click="selectPoster($event.id)"
    />
  </div>
</template>

<style lang="scss" scoped>
.buttons {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
}
</style>
