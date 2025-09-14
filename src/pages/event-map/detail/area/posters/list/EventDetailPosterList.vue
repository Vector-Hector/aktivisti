<script setup lang="ts">
import PosterTable from 'components/PosterTable.vue'
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import { QBtn, useQuasar } from 'quasar'
import SelectPosterLocation from 'components/modals/SelectPosterLocation.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { userStore } from 'src/store/UserStore'
import { useRouter } from 'vue-router'
import AssignAreaParticipants from 'pages/event-map/detail/area/AssignAreaParticipants.vue'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const $router = useRouter()
const { t } = useI18n()
const {
  event,
  eventArea,
  currentAreaFeature,
  posters,
  postersInArea,
  mergePosters
} = useEventDetailStore()
const { selectPoster } = useEventDetailPosterMixin()

function openCreatePosterDialog() {
  $q.dialog({
    component: SelectPosterLocation,
    componentProps: {
      eventId: event.value.id,
      posters: posters.value,
      initialBBox: userStore.state.bbox,
      areaFeatures: [currentAreaFeature.value]
    }
  }).onOk((poster: PosterDto) => {
    mergePosters([poster])
    if (poster.area !== eventArea.value.id) {
      $q.notify({
        color: 'warning',
        message: t('events.details.area.posters.posterNotCreatedInAreaWarning')
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
          :label="$t('events.details.area.posters.createPosterButton')"
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
.container {
  height: 100%;
}
.buttons {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
}
</style>
