<template>
  <QPage class="edit-event">
    <RouteStepper
      :steps="DoorToDoorEventSteps"
      v-model="activeStep"
    />

    <MapContainer>
      <Map
        :bounding-box="bbox"
      >
        <router-view
          name="map"
        />
      </Map>
      <MapOverlayProxy
        :title="activeStep?.label"
      >
        <router-view />
      </MapOverlayProxy>
    </MapContainer>
  </QPage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { EventTypes } from 'src/api/model/EventTypes'
import { apiClient } from 'src/api/ApiClient'
import { uiStore } from 'src/store/UiStore'
import { QPage } from 'quasar'
import MapOverlayProxy from 'components/MapOverlayProxy.vue'
import { editEventStore } from 'src/store/EditEventStore'
import Map from 'src/mapbox/Map.vue'
import MapContainer from 'components/MapContainer.vue'
import RouteStepper, { Step } from 'components/stepper/RouteStepper.vue'
import { bbox, circle } from '@turf/turf'
import { Feature } from 'geojson'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { userStore } from 'src/store/UserStore'
import { ErrorBus, NOT_AUTHORIZED } from 'src/utils/errorBus'

const DoorToDoorEventSteps = [{
  label: 'Einstellungen',
  routeName: 'edit-event-details'
}, {
  label: 'Treffpunkt/Gebiete',
  routeName: 'edit-event-geometry'
}]

export default defineComponent({
  name: 'EditEvent',
  components: {
    RouteStepper,
    MapContainer,
    QPage,
    MapOverlayProxy,
    Map
  },
  beforeRouteEnter: async (to, from, next) => {
    if (!userStore.hasAtLeastOneManagePermission()) {
      ErrorBus.emit(NOT_AUTHORIZED, 'Um eine Aktion zu erstellen benötigst du eine Koordinator*innenberechtigung')
      next({name: 'login'})
    } else {
      const [eventRequest, campaignRequest, eventAreasRequest] = await Promise.all([
        apiClient.events.get(to.params.id as string, ['eventmetricrecord_set']),
        apiClient.campaigns.list(),
        apiClient.eventAreas.list({event: to.params.id})
      ])
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
  },
  computed: {
    event() {
      return editEventStore.getState().event
    },
    steps(): Step[] {
      switch (this.event?.event_type) {
      case EventTypes.DOOR_TO_DOOR:
      default:
        return DoorToDoorEventSteps
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
      DoorToDoorEventSteps,
      activeStep: {},
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
    }) as BBox2d : null
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
}

</style>
