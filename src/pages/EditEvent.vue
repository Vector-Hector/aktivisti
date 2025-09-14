<!--FIXME(peter) 2023/12/12 The composition API doesn't support `beforeRouteEnter` so far so this a workaround
      see https://github.com/vuejs/rfcs/discussions/302-->
<script lang="ts">
export interface StepControls {
  isLastStep: ComputedRef<boolean>
  next: () => void
  previous: () => void
}

export default {
  async beforeRouteEnter(to, from, next) {
    if (!userStore.hasAtLeastOneManagePermission()) {
      //TODO(peter) Check if emit is still required and if working
      ErrorBus.emit(
        NOT_AUTHORIZED,
        'Um eine Aktion zu erstellen benötigst du eine Koordinator*innenberechtigung'
      )
      next({ name: 'login' })
    } else {
      const [eventRequest, campaignRequest, eventAreasRequest] =
        await Promise.all([
          apiClient.events.get(to.params.eventId as string, [
            'eventmetricrecord_set'
          ]),
          apiClient.campaigns.list(),
          apiClient.eventAreas.list({ event: to.params.eventId })
        ])
      if (eventRequest.payload.data.event_type === EventTypes.POSTERS) {
        const posters = await apiClient.posters.list({
          event: to.params.eventId,
          include_expired_events: true,
          include_expired_campaigns: true
        })
        posterListStore.state.posters = posters.payload.data
      }
      editEventStore.setEvent(eventRequest.payload.data)
      editEventStore.setCampaigns(campaignRequest.payload.data)
      editEventStore.setMetricRecords(
        eventRequest.payload.embedded.eventmetricrecord_set
      )
      editEventStore.setEventAreas(
        eventAreasRequest.payload.data.map((area) => {
          return {
            ...area,
            feature_id: area.feature_id ? area.feature_id : hat()
          }
        })
      )
      next(() => {
        uiStore.updateActiveElements({
          event: eventRequest.payload.data.name
        })
      })
    }
  }
}
</script>
<script setup lang="ts">
import { computed, ComputedRef, provide, onUnmounted, ref } from 'vue'

import { EventTypes } from 'src/api/model/EventTypes'
import { apiClient } from 'src/api/ApiClient'
import { uiStore } from 'src/store/UiStore'
import { QPage } from 'quasar'
import MapOverlayProxy from 'components/MapOverlayProxy.vue'
import { editEventStore } from 'src/store/EditEventStore'
import Map from 'src/map/Map.vue'
import MapContainer from 'components/MapContainer.vue'
import RouteStepper from 'components/stepper/RouteStepper.vue'
import { bbox as tbbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { ErrorBus, NOT_AUTHORIZED } from 'src/utils/errorBus'
import { userStore } from 'src/store/UserStore'
import { posterListStore } from 'src/store/PosterListStore'
import CampaignCollectionOverlayControl from 'src/map/CampaignCollectionOverlayControl.vue'
import hat from 'hat'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { Feature } from 'geojson'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const Door2DoorAndFlyerSteps = [
  {
    label: t('events.edit.steps.settings'),
    routeName: 'edit-event-details'
  },
  {
    label: t('events.edit.steps.geometry'),
    routeName: 'edit-event-geometry'
  }
]

const PosterEventSteps = [
  {
    label: t('events.edit.steps.settings'),
    routeName: 'edit-event-details'
  },
  {
    label: t('events.edit.steps.geometry'),
    routeName: 'edit-event-geometry'
  },
  {
    label: t('events.edit.steps.posterLocations'),
    routeName: 'edit-event-posters'
  }
]

const GenericEventSteps = [
  {
    label: t('events.edit.steps.settings'),
    routeName: 'edit-event-details'
  },
  {
    label: t('events.edit.steps.eventLocation'),
    routeName: 'edit-event-geometry'
  }
]

const $router = useRouter()

provide('stepControls', {
  isLastStep: computed(() => activeStep.value >= steps.value.length - 1),
  next: () => {
    const nextRouteName = steps.value[activeStep.value + 1]?.routeName
    if (nextRouteName) {
      void $router.push({
        name: nextRouteName
      })
    } else {
      void $router.push({
        name: 'event-detail',
        params: {
          eventId: event.value!.id
        }
      })
    }
  },
  previous: () => {
    const previousRouteName = steps.value[activeStep.value - 1]?.routeName
    if (previousRouteName) {
      void $router.push({
        name: previousRouteName
      })
    } else {
      $router.go(-1)
    }
  }
})

onBeforeRouteUpdate(() => {
  uiStore.updateActiveElements({
    event: editEventStore.getState().event?.name
  })
})

onUnmounted(() => {
  editEventStore.reset()
  posterListStore.reset()
})

const title = computed(() => {
  return steps.value[activeStep.value]?.label
})
const event = computed(() => {
  return editEventStore.getState().event
})
const steps = computed(() => {
  switch (event.value?.event_type) {
    case EventTypes.POSTERS:
      return PosterEventSteps
    case EventTypes.DOOR_TO_DOOR:
    case EventTypes.FLYERS:
      return Door2DoorAndFlyerSteps
    case EventTypes.GENERIC:
    default:
      return GenericEventSteps
  }
})
const areaFeatures = computed<Feature[]>(() => {
  return editEventStore.getState().eventAreas.map((area) => {
    return {
      type: 'Feature',
      id: area.feature_id,
      geometry: area.geometry,
      properties: {
        color: area.color
      }
    }
  })
})

const activeStep = ref(0)
const bbox = ref<BBox2d | null>(null)

const features = [...areaFeatures.value]
if (event.value?.location) {
  features.push(
    circle([event.value.location.lng, event.value.location.lat], 0.2)
  )
}
bbox.value =
  features.length > 0
    ? (tbbox({
        type: 'FeatureCollection',
        features: features
      }) as BBox2d)
    : userStore.state.bbox
</script>

<template>
  <QPage class="edit-event">
    <RouteStepper :steps="steps" v-model="activeStep" />

    <MapContainer class="map-container">
      <Map :bounding-box="bbox">
        <template v-slot:top-right>
          <div class="flex column q-gutter-y-sm">
            <CampaignCollectionOverlayControl />
            <router-view name="map" />
          </div>
        </template>
      </Map>
      <MapOverlayProxy :title="title">
        <router-view />
      </MapOverlayProxy>
    </MapContainer>
  </QPage>
</template>
<style lang="scss" scoped>
.edit-event {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: hidden;
  // TODO(peter@ctrl.alt.coop): Don't show/render the html element instead of hiding it.
  ::v-deep(.q-stepper__step-inner) {
    display: none;
  }

  .map-container {
    overflow: hidden;
  }
}
</style>
