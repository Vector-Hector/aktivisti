<script setup lang="ts">
import { computed } from 'vue'
import { EventDto } from 'src/api/model/EventDto'
import Map from 'src/map/Map.vue'
import { EventAreaDto, eventAreaToFeature } from 'src/api/model/EventAreaDto'
import FeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox, circle } from '@turf/turf'
import { QBtn, QIcon } from 'quasar'
import { useEventTypes } from 'src/api/model/EventTypes'
import { ionArrowBack, ionEllipse, ionPrint } from '@quasar/extras/ionicons-v5'
import { AreaDetailsDto } from 'src/api/model/AreaDetailsDto'
import { EventMetricDto } from 'src/api/model/EventMetricDto'
import { EventMetricRecordDto } from 'src/api/model/EventMetricRecordDto'
import EventMarker from 'components/EventMarker.vue'
import { useRouter } from 'vue-router'
import { useDateFormat } from 'src/utils/dateFormat'
import { useI18n } from 'vue-i18n'

interface Props {
  event: EventDto
  eventAreas: EventAreaDto[]
  metrics: EventMetricDto[]
  metricRecords: EventMetricRecordDto[]
}
const props = defineProps<Props>()

const $router = useRouter()
const { dateFormat } = useDateFormat()
const { eventTypeOptions } = useEventTypes()
const { t } = useI18n()

const areaFeatures = computed(() => {
  return props.eventAreas.map(eventAreaToFeature)
})
const zoomBox = computed(() => {
  const meetingPoint = circle(
    [props.event.location.lng, props.event.location.lat],
    0.2
  )
  return (
    areaFeatures.value.length > 0
      ? bbox({
          type: 'FeatureCollection',
          features: [...areaFeatures.value, meetingPoint]
        })
      : bbox(meetingPoint)
  ) as BBox2d
})

function countAddresses(areaDetails: AreaDetailsDto) {
  return areaDetails.streets.reduce((acc, street) => {
    return acc + street.addresses.length
  }, 0)
}
function boundingBoxOfArea(area: EventAreaDto): BBox2d {
  return bbox({
    type: 'FeatureCollection',
    features: [eventAreaToFeature(area)]
  }) as BBox2d
}
function print() {
  window.print()
}
</script>
<template>
  <div class="d2d-event-printout">
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
        {{
          `${t('events.details.meetingPoint')}: ${event.location_description}`
        }}
        <br />
        {{
          `${t('print.operationType')}:
        ${eventTypeOptions.find(({ key }) => key === event.event_type)?.label}`
        }}
        <br />
        {{ `${t('print.date')}: ${dateFormat(event.start_date, 'datetime')}` }}
      </p>
      <p>{{ event.description }}</p>
      <img class="linke-logo" src="../../assets/logo_dielinke.svg" />
      <Map class="map" :interactive="false" :bounding-box="zoomBox">
        <EventMarker v-if="event?.location" :event="event" />
        <FeatureLayer :features="areaFeatures" />
      </Map>
      <h3>{{ $t('print.headingAreas') }}</h3>
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
            <div v-if="area.area_details">
              {{
                `${countAddresses(area.area_details)} ${t('print.suffixAddressCounter')}`
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="print-page" v-for="area in eventAreas" :key="area.id">
      <img class="linke-logo" src="../../assets/logo_dielinke.svg" />
      <h1 class="headline">
        {{ $t('print.headingAreaRecordSheet', [area.name]) }}
      </h1>
      <div class="row q-col-gutter-x-sm">
        <div class="col-8">
          <p class="facts">
            {{
              `${t('print.operationType')}:
        ${eventTypeOptions.find(({ key }) => key === event.event_type)?.label}`
            }}<br />
            {{ `${t('print.operationName')}: ${event.name}` }}<br />
            {{
              `${t('print.date')}:  ${dateFormat(event.start_date, 'datetime')}`
            }}<br />
            <template v-if="area.area_details">
              {{
                `${t('print.addressCounter')}: ${countAddresses(area.area_details)}`
              }}
            </template>
          </p>
          <Map
            class="area-map"
            :interactive="false"
            :bounding-box="boundingBoxOfArea(area)"
          >
            <FeatureLayer :features="[eventAreaToFeature(area)]" />
          </Map>
        </div>
        <div class="col-4">
          <h4 class="address-headline">{{ $t('print.streets') }}</h4>
          <span
            class="street"
            v-for="street in area.area_details?.streets"
            :key="street.name"
          >
            <p class="street-name">{{ street.name }}</p>
          </span>
          <span v-if="area.area_details?.streets.length === 0">{{
            $t('print.noAddressesFound')
          }}</span>
        </div>
      </div>

      <div class="metrics-entry-table">
        <div class="tableheader row">
          <div class="col-3">{{ $t('print.metricsTable.metrics') }}</div>
          <div class="col-6">{{ $t('print.metricsTable.tally') }}</div>
          <div class="col-2">{{ $t('print.metricsTable.total') }}</div>
        </div>
        <div
          v-for="metric in metrics"
          :key="metric.name"
          class="metric-item row"
        >
          <div class="col-3 metric-item-cell">
            <span>{{ metric.name }}</span>
          </div>
          <div class="col-6 metric-item-cell"></div>
          <div class="col-3 metric-item-cell"></div>
        </div>
        <div class="metric-item row">
          <div class="col-3 metric-item-cell">
            <span>{{ $t('print.metricsTable.collectedLeads') }}</span>
          </div>
          <div class="col-6 metric-item-cell"></div>
          <div class="col-3 metric-item-cell"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.d2d-event-printout {
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
  width: 3cm;
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

.metrics-entry-table {
  margin: 0.5cm 0 0;

  .tableheader {
    font-weight: bold;
    font-size: 1.2rem;
    line-height: 1.3;
  }

  .metric-item {
    height: 2.5cm;
    border-top: 1px dotted $grey-4;
    display: flex;
    align-items: center;

    &:last-of-type {
      border-bottom: 1px dotted $grey-4;
    }
  }

  .metric-item-cell {
    border-left: 1px dotted $grey-4;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;

    &:last-of-type {
      border-right: 1px dotted $grey-4;
    }
  }

  .target-hint {
    align-self: flex-start;
    font-size: 0.8rem;
    color: $grey-5;
  }
}

.address-headline {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.street-name {
  margin: 0;
  font-weight: bold;
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
  .d2d-event-printout {
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
