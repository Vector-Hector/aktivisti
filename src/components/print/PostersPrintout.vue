<template>
  <div class="posters-printout">
    <QBtn
      class="back-button bg-white"
      :icon="ionArrowBack"
      @click="$router.go(-1)"
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
        Treffpunkt: {{ event.location_description }}<br />
        Einsatztyp:
        {{ eventTypeOptions.find(({ key }) => key === event.event_type)?.label
        }}<br />
        Datum: {{ $utils.dateFormat(event.start_date) }}
      </p>
      <p>{{ event.description }}</p>
      <img class="linke-logo" src="../../assets/logo_dielinke.png" />
      <Map class="map" :interactive="false" :bounding-box="zoomBox">
        <EventMarker v-if="event?.location" :event="event" />
        <FeatureLayer :features="areaFeatures" />
      </Map>
      <h3>Gebiete</h3>
      <div class="row q-col-gutter-md">
        <div class="area-item col-4" v-for="area in eventAreas" :key="area.id">
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
      <img class="linke-logo" src="../../assets/logo_dielinke.png" />
      <h1 class="headline">Erfassungsbogen für Gebiet: {{ area.name }}</h1>
      <div class="row q-col-gutter-x-sm">
        <div class="col-8">
          <p class="facts">
            Einsatztyp:
            {{
              eventTypeOptions.find(({ key }) => key === event.event_type)
                ?.label
            }}<br />
            Einsatzname: {{ event.name }}<br />
            Datum: {{ $utils.dateFormat(event.start_date) }}<br />
          </p>
          <Map
            class="area-map"
            :interactive="false"
            :bounding-box="boundingBoxOfArea(area)"
          >
            <FeatureLayer :features="[eventAreaToFeature(area)]" />
            <PosterMarkerLayer
              :posters="posters.filter((poster) => poster.area === area.id)"
              :editable="false"
              :opacity="1.0"
              :is-print="true"
            />
          </Map>
        </div>
      </div>
      <div class="posters-entry-table">
        <div class="tableheader row">
          <div class="col-1 poster-item-cell">#</div>
          <div class="col-5 poster-item-cell location">Ort</div>
          <div class="col-2 poster-item-cell">Position</div>
          <div class="col-2 poster-item-cell">letzter<br />Status</div>
          <div class="col-2 poster-item-cell new-status">
            aktueller<br />Status
          </div>
        </div>
        <div
          class="poster-item row"
          v-for="{
            poster_id,
            location_description,
            status,
            mounted_on
          } in parsedPoster.filter((poster) => poster.area === area.id)"
          :key="poster_id"
        >
          <div class="col-1 poster-item-cell">{{ poster_id }}</div>
          <div class="col-5 poster-item-cell location">
            {{ location_description }}
          </div>
          <div class="col-2 poster-item-cell">{{ mounted_on }}</div>
          <div class="col-2 poster-item-cell">{{ status }}</div>
          <div class="col-2 poster-item-cell new-status">
            <div v-for="(posterStatus, index) in posterStates" :key="index">
              <QIcon :name="ionSquareOutline" />
              {{ posterStatus }}
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="print-page" v-if="arePostersOutsideArea">
      <img class="linke-logo" src="../../assets/logo_dielinke.png" />
      <h1 class="headline">Erfassungsbogen für Plakate ohne Gebiet</h1>
      <div class="row q-col-gutter-x-sm">
        <div class="col-8">
          <p class="facts">
            Einsatztyp:
            {{
              eventTypeOptions.find(({ key }) => key === event.event_type)
                ?.label
            }}<br />
            Einsatzname: {{ event.name }}<br />
            Datum: {{ $utils.dateFormat(event.start_date) }}<br />
          </p>
          <Map class="area-map" :interactive="false" :bounding-box="zoomBox">
            <FeatureLayer :features="areaFeatures" />
            <PosterMarkerLayer
              :posters="posters.filter((poster) => poster.area === null)"
              :editable="false"
              :opacity="1.0"
              :is-print="true"
            />
          </Map>
        </div>
      </div>
      <div class="posters-entry-table">
        <div class="tableheader row">
          <div class="col-1 poster-item-cell">#</div>
          <div class="col-5 poster-item-cell location">Ort</div>
          <div class="col-2 poster-item-cell">Position</div>
          <div class="col-2 poster-item-cell">letzter<br />Status</div>
          <div class="col-2 poster-item-cell new-status">
            aktueller<br />Status
          </div>
        </div>
        <div
          class="poster-item row"
          v-for="{
            poster_id,
            location_description,
            status,
            mounted_on
          } in parsedPoster.filter((poster) => poster.area === null)"
          :key="poster_id"
        >
          <div class="col-1 poster-item-cell">{{ poster_id }}</div>
          <div class="col-5 poster-item-cell location">
            {{ location_description }}
          </div>
          <div class="col-2 poster-item-cell">{{ mounted_on }}</div>
          <div class="col-2 poster-item-cell">{{ status }}</div>
          <div class="col-2 poster-item-cell new-status">
            <div v-for="(posterStatus, index) in posterStates" :key="index">
              <QIcon :name="ionSquareOutline" />
              {{ posterStatus }}
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import Map from 'src/map/Map.vue'
import { EventAreaDto, eventAreaToFeature } from 'src/api/model/EventAreaDto'
import FeatureLayer from 'src/map/AreaFeatureLayer'
import { bbox, circle } from '@turf/turf'
import { QBtn, QIcon } from 'quasar'
import { eventTypeOptions } from 'src/api/model/EventTypes'
import {
  ionArrowBack,
  ionEllipse,
  ionPrint,
  ionSquareOutline
} from '@quasar/extras/ionicons-v5'
import EventMarker from 'components/EventMarker.vue'
import {
  PosterDto,
  PosterMountUtil,
  PosterStatus,
  PosterStatusUtil
} from 'src/api/model/PosterDto'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'

interface Props {
  event: EventDto
  eventAreas: EventAreaDto[]
  posters: PosterDto[]
}
const props = defineProps<Props>()

const areaFeatures = computed(() => {
  return props.eventAreas.map(eventAreaToFeature)
})
const zoomBox = computed(() => {
  const meetingPoint = circle(
    [props.event.location.lng, props.event.location.lat],
    0.2
  )
  return areaFeatures.value.length > 0
    ? bbox({
        type: 'FeatureCollection',
        features: [...areaFeatures.value, meetingPoint]
      })
    : bbox(meetingPoint)
})
const parsedPoster = computed(() => {
  return props.posters
    .map(({ poster_id, area, location_description, status, mounted_on }) => ({
      poster_id: poster_id,
      area: area,
      location_description: location_description,
      status: PosterStatusUtil.getLabel(status),
      mounted_on: PosterMountUtil.getLabel(mounted_on)
    }))
    .sort((a, b) => a.poster_id - b.poster_id)
})
const posterStates = computed(() => {
  return Object.keys(PosterStatus).map((key) =>
    PosterStatusUtil.getLabel(key as PosterStatus)
  )
})
const arePostersOutsideArea = computed(() => {
  return props.posters.some(({ area }) => area === null)
})

function boundingBoxOfArea(area: EventAreaDto) {
  return bbox({
    type: 'FeatureCollection',
    features: [eventAreaToFeature(area)]
  })
}
function print() {
  window.print()
}
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
  margin: 2.2rem 0;
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

.posters-entry-table {
  page-break-inside: auto;
  margin: 0.5cm 0 0;

  .row {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  .tableheader {
    font-weight: bold;
    font-size: 1.2rem;
    line-height: 1.3;
    border-top: 1px dotted $grey-4;
  }

  .poster-item {
    border-top: 1px dotted $grey-4;
    display: flex;
    page-break-after: auto;
  }

  &:last-of-type {
    border-bottom: 1px dotted $grey-4;
  }

  .poster-item-cell {
    border-left: 1px dotted $grey-4;
    display: flex;
    align-items: center;
    justify-content: center;

    &.location {
      justify-content: flex-start;
    }

    &.new-status {
      display: block;
    }
  }

  &:last-of-type {
    border-right: 1px dotted $grey-4;
  }
}

.back-button,
.print-button {
  position: fixed;
  top: 1rem;
  z-index: 10;
}

@media print {
  .back-button,
  .print-button {
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
