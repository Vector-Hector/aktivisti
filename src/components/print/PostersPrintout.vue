<template>
  <div class="posters-printout">
    <QBtn
      class="back-button"
      :icon="ionArrowBack"
      @click="$router.go(-1)"
      style="background: white;"
      round
    />
    <QBtn
      class="print-button"
      :icon="ionPrint"
      @click="print()"
      color="primary"
      round
    />
    <div class="print-page">
      <h1 class="headline">{{ event.name }}</h1>
      <p class="facts">
        Treffpunkt: {{ event.location_description }}<br>
        Einsatztyp: {{ eventTypeOptions.find(({key}) => key === event.event_type)?.label }}<br>
        Datum: {{ $utils.dateFormat(event.start_date) }}
      </p>
      <p>{{ event.description }}</p>
      <img class="linke-logo" src="../../assets/logo_dielinke.png">
      <Map
        class="map"
        :interactive="false"
        :bounding-box="zoomBox"
      >
        <EventMarker
          v-if="event?.location"
          :event="event"
        />
        <FeatureLayer
          :features="areaFeatures"
        />
      </Map>
      <h3>Gebiete</h3>
      <div class="row q-col-gutter-md">
        <div
          class="area-item col-4"
          v-for="area in eventAreas"
          :key="area.id"
        >
          <QIcon
            class="area-icon"
            :style="{
            color: area.color
          }"
            :name="ionEllipse"
          />
          <div class="area-label">
            <div>{{ area.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="print-page" v-for="area in eventAreas" :key="area.id">
      <img class="linke-logo" src="../../assets/logo_dielinke.png">
      <h1 class="headline">Erfassungsbogen für Gebiet: {{ area.name }}</h1>
      <div class="row q-col-gutter-x-sm">
        <div class="col-8">
          <p class="facts">
            Einsatztyp: {{ eventTypeOptions.find(({key}) => key === event.event_type)?.label }}<br>
            Einsatzname: {{ event.name }}<br>
            Datum: {{ $utils.dateFormat(event.start_date) }}<br>
          </p>
          <Map
            class="area-map"
            :interactive="false"
            :bounding-box="boundingBoxOfArea(area)"
          >
            <FeatureLayer
              :features="[eventAreaToFeature(area)]"
            />
          </Map>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import Map from 'src/mapbox/Map.vue'
import { Feature } from 'geojson'
import { EventAreaDto, eventAreaToFeature } from 'src/api/model/EventAreaDto'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer'
import { BBox } from '@turf/helpers/dist/js/lib/geojson'
import { bbox, circle } from '@turf/turf'
import { QBtn, QIcon } from 'quasar'
import { eventTypeOptions } from 'src/api/model/EventTypes'
import { ionArrowBack, ionEllipse, ionPrint } from '@quasar/extras/ionicons-v5'
import EventMarker from 'components/EventMarker.vue'
import { PosterDto } from 'src/api/model/PosterDto';


export default defineComponent({
  name: 'PostersPrintout',
  components: {
    EventMarker,
    Map,
    FeatureLayer,
    QIcon,
    QBtn
  },
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true
    },
    eventAreas: {
      type: Array as PropType<EventAreaDto[]>,
      required: true
    },
    posters: {
      type: Array as PropType<PosterDto[]>,
      required: true
    },
  },
  data() {
    return {
      eventTypeOptions,
      ionEllipse,
      ionArrowBack,
      ionPrint
    }
  },
  computed: {
    areaFeatures(): Feature[] {
      return this.eventAreas.map(eventAreaToFeature)
    },
    zoomBox(): BBox {
      const meetingPoint = circle([this.event.location.lng, this.event.location.lat], 0.2)
      return this.areaFeatures.length > 0 ? bbox({
        type: 'FeatureCollection',
        features: [...this.areaFeatures, meetingPoint]
      }) : bbox(meetingPoint)
    },
  },
  methods: {
    eventAreaToFeature(area: EventAreaDto) {
      return eventAreaToFeature(area)
    },
    boundingBoxOfArea(area: EventAreaDto) {
      return bbox({
        type: 'FeatureCollection',
        features: [eventAreaToFeature(area)]
      })
    },
    print() {
      window.print()
    }
  }
})
</script>

<style lang="scss" scoped>
.posters-printout {
  overflow: auto;

  h1 {
    font-size: 2rem;
    line-height: 1;
  }

  h3 {
    font-size: 1.2rem;
    line-height: 1.2;

  }
}

.date {
  font-weight: bold;
}

.map {
  height: 13cm;
  flex: none;
}

.linke-logo {
  position: absolute;
  top: 0.5cm;
  right: 0.5cm;
  width: 5cm;
}

.print-page {
  position: relative;
}

.facts {
  font-weight: bold;
}

.area-item {
  display: flex;
  flex-direction: row;
}

.headline {
  margin: 2.2rem 0
}

.area-icon {
  font-size: 1.2rem;
  padding: 0 1rem;
  align-self: center;
}

.area-map {
  height: 8cm;
  flex: none;
}

.back-button, .print-button {
  position: fixed;
  top: 1rem;
  z-index: 10;
}

@media print {
  .back-button, .print-button {
    display: none;
  }
  .posters-printout {
    overflow: initial;
  }
}

.back-button {
  left: 1rem;
}

.print-button {
  right: 1rem;
}


</style>
