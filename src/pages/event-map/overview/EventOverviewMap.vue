<template>
  <Geocoder
    :access-token="accessToken"
    :collapsed="true"
    position="top-left"
    :countries="['de']"
  />
  <span v-if="clusterMode">
    <ClusterLayer
      :clusters="clusters"
    />
  </span>
  <span
    v-else
  >
    <span
      v-for="event in events"
      :key="event.id"
    >
      <EventMarker
        :event="event"
      >
        <MarkerPopup>
          <div class="popup-contents">
            <span class="popup-title">{{ event.name }}</span>
            <span class="popup-type">
              {{ getEventTypeLabel(event.event_type) }}
            </span>
            <span class="popup-campaign">{{ event.campaigns?.map(({name}) => name).join(',') }}</span>

            <span class="popup-date">
              {{ new Date(event.start_date).toLocaleString() }}
            </span>
            <QBtn
              label="Mitmachen/Infos"
              color="primary"
              :to="`/events/${event.id}`"
            />
          </div>
        </MarkerPopup>
      </EventMarker>
    </span>
  </span>
</template>
<script lang="ts">
import { defineComponent, inject, onUnmounted } from 'vue'
import MarkerPopup from 'src/mapbox/popup/MarkerPopup.vue'
import { MapInject } from 'src/mapbox/Map.vue'
import { ClusterDto } from 'src/api/model/ClusterDto'
import { EVENT_MAP_MAX_EVENTS } from 'src/constants'
import ClusterLayer from 'src/mapbox/ClusterLayer.vue'
import EventsOverviewMixin from 'pages/event-map/overview/EventsOverviewMixin'
import { eventOverviewStore } from 'src/store/EventOverviewStore'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { QBtn } from 'quasar'
import { eventTypeOptions, EventTypes } from 'src/api/model/EventTypes'
import EventMarker from 'components/EventMarker.vue'
import Geocoder from 'src/mapbox/Geocoder.vue'

export default defineComponent({
  name: 'EventOverviewMap',
  mixins: [EventsOverviewMixin],
  components: {
    Geocoder,
    EventMarker,
    MarkerPopup,
    QBtn,
    ClusterLayer
  },
  setup() {
    const map = inject(MapInject)!

    const updateBounds = () => {
      eventOverviewStore.setBbox(map.value?.getBounds().toArray().flat() as BBox2d)
    }
    map.value.on('zoomend', updateBounds)
    map.value.on('moveend', updateBounds)
    onUnmounted(() => {
      map.value.off('zoomend', updateBounds)
      map.value.off('moveend', updateBounds)
    })
    updateBounds()
    return {
      map
    }
  },
  computed: {
    accessToken() {
      return process.env.APP_MAPBOX_TOKEN
    },
    clusterTotal(): number {
      return this.clusters.reduce((acc: number, item: ClusterDto) => acc + item.count, 0)
    },
    clusterMode(): boolean {
      return this.clusterTotal > EVENT_MAP_MAX_EVENTS
    }
  },
  watch: {
    clusterMode(isClusterMode) {
      if (isClusterMode && ((this.map?.getZoom() ?? 0) > 15)) {
        this.$q.notify({
          multiLine: true,
          message: '<h5 class="too-many-events-headline">Hier ist zuviel los</h5>' +
            'Nicht alle Aktionen werden angezeigt, da dies zuviel für die Karte wäre. Nutze die Listenansicht',
          html: true,
          group: 'too-many-events-alert',
          color: 'warning'
        })
      }
    }
  },
  methods: {
    getEventTypeLabel(eventType: EventTypes): string | undefined {
      return eventTypeOptions.find(({key}) => key === eventType)?.label
    }
  }
})
</script>
<style lang="scss" scoped>
.popup-title {
  font-weight: bold;
  display: block;
  font-size: 1rem;
}

.popup-type {
  display: block;
  font-size: 0.9rem;
}

.popup-campaign {
  display: block;
  font-size: 0.9rem;
}

.popup-date {
  display: block;
  font-size: 0.9rem;
}

.join-link {
  align-self: flex-end;

  Button {
    padding: 3px 6px;
  }

  margin-top: 6px;
}

.popup-contents {
  display: flex;
  flex-direction: column;
}

::v-global(.too-many-events-headline) {
  margin: 0;
}
</style>
