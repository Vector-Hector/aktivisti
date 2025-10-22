<script setup lang="ts">
import PosterTable from 'components/PosterTable.vue'
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import { QBtn, useQuasar } from 'quasar'
import SelectPosterLocation from 'components/modals/SelectPosterLocation.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { useUserStore } from 'src/stores/user'
import { useRouter } from 'vue-router'
import AssignAreaParticipants from 'pages/event-map/detail/area/AssignAreaParticipants.vue'
import { useEventStore } from 'src/stores/event'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const $router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const eventStore = useEventStore()
const { selectPoster } = useEventDetailPosterMixin()

function openCreatePosterDialog() {
  $q.dialog({
    component: SelectPosterLocation,
    componentProps: {
      eventId: eventStore.event.id,
      posters: eventStore.posters,
      initialBBox: userStore.bbox,
      areaFeatures: [eventStore.currentAreaFeature]
    }
  }).onOk((poster: PosterDto) => {
    eventStore.mergePosters([poster])
    if (poster.area !== eventStore.eventArea.id) {
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
        <AssignAreaParticipants v-if="eventStore.eventArea" />
      </div>
    </div>
    <div class="row q-py-sm">
      <div class="col-grow buttons">
        <QBtn
          v-if="eventStore.event.poster_creation_allowed"
          color="primary"
          :label="$t('events.details.area.posters.createPosterButton')"
          :icon="ionLocationSharp"
          @click="openCreatePosterDialog"
        />
      </div>
    </div>
    <PosterTable
      :posters="eventStore.postersInArea"
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
