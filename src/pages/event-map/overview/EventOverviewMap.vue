<template>
  <Geocoder :collapsed="true" position="top-left" :countries="['de']" />
  <ClusterLayer
    :feature-collection="featureCollection"
    @event-clicked="activeEvent = $event"
    :icon-image-value="['get', 'event_type']"
  />
  <CoordinatesPopup
    v-if="activeEvent"
    :coordinates="activeEvent.geometry.coordinates"
    @close="activeEvent = null"
  >
    <EventPopupContents v-if="activeEvent" :event="activeEvent">
    </EventPopupContents>
  </CoordinatesPopup>
</template>
<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { EVENT_MAP_MAX_EVENTS } from 'src/constants'
import ClusterLayer from 'src/map/ClusterLayer'
import EventsOverviewMixin from 'pages/event-map/overview/EventsOverviewMixin'
import { eventOverviewStore } from 'src/store/EventOverviewStore'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import Geocoder from 'src/map/Geocoder.vue'
import { uiStore } from 'src/store/UiStore'
import maplibregl from 'maplibre-gl'
import { useMap } from 'src/map/Map.vue'

export default defineComponent({
  name: 'EventOverviewMap',
  mixins: [EventsOverviewMixin],
  components: {
    EventPopupContents,
    CoordinatesPopup,
    Geocoder,
    ClusterLayer
  },
  setup() {
    const map = useMap()

    void loadImageIfNonExistent(
      map.value,
      POSTER_SYMBOL_NAME,
      '/static/icons/map-pin-poster.png'
    )
    void loadImageIfNonExistent(
      map.value,
      DOOR_TO_DOOR_SYMBOL_NAME,
      '/static/icons/map-pin-door.png'
    )
    void loadImageIfNonExistent(
      map.value,
      FLYER_SYMBOL_NAME,
      '/static/icons/map-pin-flyer.png'
    )
    void loadImageIfNonExistent(
      map.value,
      GENERIC_SYMBOL_NAME,
      '/static/icons/map-pin-generic.png'
    )
    const updateBounds = () => {
      eventOverviewStore.setBbox(
        map.value?.getBounds().toArray().flat() as BBox2d
      )
    }
    map.value.on('zoomend', updateBounds)
    map.value.on('moveend', updateBounds)
    onUnmounted(() => {
      map.value.off('zoomend', updateBounds)
      map.value.off('moveend', updateBounds)
    })
    updateBounds()
    return {
      map,
      activeEvent
    }
  },
  computed: {
    clusterTotal(): number {
      return this.featureCollection?.features.length ?? 0
    },
    clusterMode(): boolean {
      return this.clusterTotal > EVENT_MAP_MAX_EVENTS
    }
  },
  watch: {
    clusterMode(isClusterMode) {
      if (isClusterMode && (this.map?.getZoom() ?? 0) > 15) {
        this.$q.notify({
          multiLine: true,
          message:
            '<h5 class="too-many-events-headline">Hier ist zuviel los</h5>' +
            'Nicht alle Aktionen werden angezeigt, da dies zuviel für die Karte wäre. Nutze die Listenansicht',
          html: true,
          group: 'too-many-events-alert',
          color: 'warning'
        })
      }
    }
  },
  beforeMount() {
    const previousZoom = uiStore.getState().mapZoom
    if (previousZoom != null) this.map.setZoom(previousZoom, {})
    uiStore.setMapZoom(null)
  },
  beforeUnmount() {
    const map: maplibregl.Map = this.map
    uiStore.setMapZoom(map.getZoom())
  }
})
</script>
<style lang="scss" scoped>
::v-global(.too-many-events-headline) {
  margin: 0;
}
</style>
