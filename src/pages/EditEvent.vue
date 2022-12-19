<template>
  <QPage class="edit-event">
    <RouteStepper
      :steps="steps"
      v-model="activeStep"
    />

    <MapContainer
      class="map-container"
    >
      <Map
        :bounding-box="bbox"
      >
        <template v-slot:top-right>
          <div class="flex column q-gutter-y-sm">
            <CampaignCollectionOverlayControl />
            <router-view
              name="map"
            />
          </div>
        </template>
      </Map>
      <MapOverlayProxy
        :title="title"
      >
        <router-view />
      </MapOverlayProxy>
    </MapContainer>
  </QPage>
</template>
<script lang="ts">
import { computed, defineComponent, ComputedRef } from 'vue'

import { EventTypes } from 'src/api/model/EventTypes'
import { apiClient } from 'src/api/ApiClient'
import { uiStore } from 'src/store/UiStore'
import { QPage } from 'quasar'
import MapOverlayProxy from 'components/MapOverlayProxy.vue'
import { editEventStore } from 'src/store/EditEventStore'
import Map from 'src/map/Map.vue'
import MapContainer from 'components/MapContainer.vue'
import RouteStepper, { Step } from 'components/stepper/RouteStepper.vue'
import { bbox, circle } from '@turf/turf'
import { Feature } from 'geojson'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { ErrorBus, NOT_AUTHORIZED } from 'src/utils/errorBus'
import { userStore } from 'src/store/UserStore'
import { posterListStore } from 'src/store/PosterListStore'
import CampaignCollectionOverlayControl from 'src/map/CampaignCollectionOverlayControl.vue'

const Door2DoorAndFlyerSteps = [{
  label: 'Einstellungen',
  routeName: 'edit-event-details'
}, {
  label: 'Treffpunkt/Gebiete',
  routeName: 'edit-event-geometry'
}]

const PosterEventSteps = [{
  label: 'Einstellungen',
  routeName: 'edit-event-details'
}, {
  label: 'Treffpunkt/Gebiete',
  routeName: 'edit-event-geometry'
}, {
  label: 'Standorte',
  routeName: 'edit-event-posters'
}]

const GenericEventSteps = [{
  label: 'Einstellungen',
  routeName: 'edit-event-details'
}, {
  label: 'Veranstaltungsort',
  routeName: 'edit-event-geometry'
}]

export interface StepControls {
  isLastStep: ComputedRef<boolean>,
  abort: () => void
  next: () => void
  previous: () => void
}


export default defineComponent({
  name: 'EditEvent',
  components: {
    CampaignCollectionOverlayControl,
    RouteStepper,
    MapContainer,
    QPage,
    MapOverlayProxy,
    Map
  },
  provide() {
    return {
      stepControls: {
        isLastStep: computed(() => this.activeStep >= this.steps.length - 1),
        abort: () => {
          void this.$router.push({
            name: 'event-detail',
            params: {
              eventId: this.event!.id
            }
          })
        },
        next: () => {
          const nextRouteName = this.steps[this.activeStep + 1]?.routeName
          if (nextRouteName) {
            void this.$router.push({
              name: nextRouteName
            })
          } else {
            void this.$router.push({
              name: 'event-detail',
              params: {
                eventId: this.event!.id
              }
            })
          }
        },
        previous: () => {
          const previousRouteName = this.steps[this.activeStep - 1]?.routeName
          if (previousRouteName) {
            void this.$router.push({
              name: previousRouteName
            })
          } else {
            this.$router.go(-1)
          }
        }
      } as StepControls
    }
  },
  beforeRouteEnter: async (to, from, next) => {
    if (!userStore.hasAtLeastOneManagePermission()) {
      ErrorBus.emit(NOT_AUTHORIZED, 'Um eine Aktion zu erstellen benötigst du eine Koordinator*innenberechtigung')
      next({name: 'login'})
    } else {
      const [eventRequest, campaignRequest, eventAreasRequest] = await Promise.all([
        apiClient.events.get(to.params.eventId as string, ['eventmetricrecord_set']),
        apiClient.campaigns.list(),
        apiClient.eventAreas.list({event: to.params.eventId})
      ])
      if (eventRequest.payload.data.event_type === EventTypes.POSTERS) {
        const posters = await apiClient.posters.list({event: to.params.eventId})
        posterListStore.state.posters = posters.payload.data
      }
      editEventStore.setEvent(eventRequest.payload.data)
      editEventStore.setCampaigns(campaignRequest.payload.data)
      editEventStore.setMetricRecords(eventRequest.payload.embedded.eventmetricrecord_set)
      editEventStore.setEventAreas(eventAreasRequest.payload.data)
      next(() => {
        uiStore.updateActiveElements({
          event: eventRequest.payload.data.name
        })
      })
    }
  },
  beforeRouteUpdate() {
    uiStore.updateActiveElements({
      event: editEventStore.getState().event?.name
    })
  },
  unmounted() {
    editEventStore.reset()
    posterListStore.reset()
  },
  computed: {
    title(): string | undefined {
      return this.steps[this.activeStep]?.label
    },
    event() {
      return editEventStore.getState().event
    },
    steps(): Step[] {
      switch (this.event?.event_type) {
        case EventTypes.POSTERS:
          return PosterEventSteps
        case EventTypes.DOOR_TO_DOOR:
        case EventTypes.FLYERS:
          return Door2DoorAndFlyerSteps
        case EventTypes.GENERIC:
        default:
          return GenericEventSteps
      }
    },
    areaFeatures(): Feature[] {
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
    }
  },
  data() {
    return {
      EventTypes,
      Door2DoorAndFlyerSteps,
      activeStep: 0,
      bbox: null as BBox2d | null
    }
  },
  created() {
    const features = [...this.areaFeatures]
    if (this.event?.location) {
      features.push(circle([this.event.location.lng, this.event.location.lat], 0.2))
    }
    this.bbox = features.length > 0 ? bbox({
      type: 'FeatureCollection',
      features: features
    }) as BBox2d : userStore.state.bbox
  }
})
</script>

<style lang="scss" scoped>

.edit-event {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: hidden;
  // TODO(peter@ctrl.alt.coop): Don't show/render the html element instead of hiding it.
  ::v-deep .q-stepper__step-inner {
    display: none
  }

  .map-container {
    overflow: hidden;
  }
}

</style>
