<template>
  <div class="container q-py-sm">
    <div class="row">
      <div class="col">
        <AssignAreaParticipants />
      </div>
    </div>
    <div class="row">
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
<script lang="ts">
import PosterTable from 'components/PosterTable.vue'
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import { defineComponent } from 'vue'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { ionLocationSharp } from '@quasar/extras/ionicons-v5'
import { QBtn } from 'quasar'
import SelectPosterLocation from 'components/modals/SelectPosterLocation.vue'
import { PosterDto } from 'src/api/model/PosterDto'
import { bbox, circle, point } from '@turf/turf'
import { userStore } from 'src/store/UserStore'
import { uiStore } from 'src/store/UiStore'
import { NavigationGuardNext, RouteLocation } from 'vue-router'
import AssignAreaParticipants from 'pages/event-map/detail/area/AssignAreaParticipants.vue'

function updateRoute(to: RouteLocation, from: RouteLocation, next: NavigationGuardNext) {
  uiStore.updateActiveElements({
    poster: `${uiStore.state.activeTitleElements.eventArea}: Plakate`
  })
  next()
}

export default defineComponent({
  name: 'EventDetailPosterList',
  components: {
    PosterTable,
    AssignAreaParticipants,
    QBtn
  },
  mixins: [EventDetailPosterMixin, EventDetailStoreMixin],
  beforeRouteEnter: updateRoute,
  beforeRouteUpdate: updateRoute,
  data() {
    return {
      ionLocationSharp
    }
  },
  methods: {
    openCreatePosterDialog() {
      let initialBoundingBox = this.postersInArea.length > 0 ? bbox({
        type: 'FeatureCollection',
        features: this.postersInArea.map(
          ({location}) => circle(point([location.lng, location.lat]), 1)
        )
      }) : null
      if (!initialBoundingBox) {
        initialBoundingBox = this.eventArea?.geometry ? bbox({
          type: 'Feature',
          geometry: this.eventArea.geometry
        }) : null
      }
      if (!initialBoundingBox) {
        initialBoundingBox = userStore.state.bbox ?? null
      }
      this.$q.dialog({
        component: SelectPosterLocation,
        componentProps: {
          eventId: this.event.id,
          posters: this.posters,
          initialBBox: initialBoundingBox,
          areaFeatures: this.areaFeatures
        }
      })
        .onOk((poster: PosterDto) => {
          this.mergePosters([poster])
          if (poster.area !== this.eventArea.id) {
            this.$q.notify({
              color: 'warning',
              message: 'Das neue Plakat wurde nicht im derzeit ausgewählten Gebiet platziert!'
            })
          }
          void this.$router.push({
            name: 'event-detail-poster-detail',
            params: {
              posterId: poster.id,
              areaId: poster.area ?? 'undefined'
            }
          })
        })
    }
  }
})
</script>
<style lang="scss" scoped>
.buttons {
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
}
</style>
