<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Marker from 'src/map/Marker.vue'
import DrawControl from 'src/map/DrawControl.vue'
import { EventAreaDto } from 'src/api/model/EventAreaDto'
import { routePlannerStyles as routePlannerStylesFunction } from './route-planner.styles'
import { useEditEventGeometryMixin } from 'pages/edit-event/geometry/EditEventGeometryMixin'
import { bbox, booleanPointInPolygon, circle, polygon } from '@turf/turf'
import {
  EditEventBus,
  PAN_TO_BBOX,
  START_DRAW_AREA
} from 'src/store/EditEventStore'
import { noop } from 'lodash-es'
import { useInjectMapMixin } from 'pages/event-detail/InjectMapMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import AddressMarkerLayer from 'src/map/AddressMarkerLayer'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'
import { useEditEventMixin } from 'pages/edit-event/EditEventMixin'
import { IMapboxDrawControls } from '@mapbox/mapbox-gl-draw'

const defaultColors = [
  '#E22A3A',
  '#37FFFF',
  '#91BF77',
  '#F8AC60',
  '#8E197C',
  '#9E2B25',
  '#266DD3',
  '#FDE74C',
  '#55DBCB',
  '#495D63'
]

const { event, eventAreas, posters } = useEditEventMixin()
const { updateArea, deleteAreaByFeatureId, features } =
  useEditEventGeometryMixin()
const { map } = useInjectMapMixin()

const routePlannerStyles = ref<any[]>(routePlannerStylesFunction('#000000'))
const drawControls = ref<IMapboxDrawControls>({
  polygon: true,
  trash: true
})
const zoomLevel = ref<number>(0)
const zoomListener = ref(noop)
const startDrawListener = ref(noop)
const panToBBoxListener = ref(noop)
const draw = ref<InstanceType<typeof DrawControl> | null>(null)

zoomLevel.value = map.value?.getZoom() ?? 0

const addresses = computed(() =>
  eventAreas.value
    .map(({ area_details }) => area_details?.streets ?? [])
    .flat()
    .map(({ addresses }) => addresses)
    .flat()
)

watch(
  () => event.value.location,
  (newLocation, oldLocation) => {
    const bounds = map.value?.getBounds()
    if (bounds) {
      const boundsGeometry = polygon([
        [
          [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
          [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
          [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
          [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
          [bounds.getNorthWest().lng, bounds.getNorthWest().lat]
        ]
      ])
      const { lat, lng } = newLocation
      if (
        oldLocation === null ||
        !booleanPointInPolygon([lng, lat], boundsGeometry)
      ) {
        map.value?.fitBounds(bbox(circle([lng, lat], 2)) as BBox2d)
      }
    }
  },
  { deep: true }
)

onMounted(() => {
  startDrawListener.value = () => {
    draw.value?.changeMode('draw_polygon')
  }
  panToBBoxListener.value = (bbox: BBox2d) => {
    map.value?.fitBounds(bbox)
  }

  EditEventBus.on(START_DRAW_AREA, startDrawListener.value)
  EditEventBus.on(PAN_TO_BBOX, panToBBoxListener.value)

  zoomListener.value = () => {
    zoomLevel.value = map.value?.getZoom() ?? Infinity
  }
  map.value?.on('zoomend', zoomListener.value)
})

onUnmounted(() => {
  map.value?.off('zoomend', zoomListener.value)
  EditEventBus.off(START_DRAW_AREA, startDrawListener.value)
  EditEventBus.off(PAN_TO_BBOX, panToBBoxListener.value)
})

async function handleCreatedFeatures(e: any) {
  for (const feature of e.features) {
    const existingArea = eventAreas.value.find(
      (area) => area.feature_id === feature.id
    )
    const updatedArea = Object.assign(
      {
        name: `Gebiet ${eventAreas.value.length + 1}`,
        color: defaultColors[eventAreas.value.length] ?? defaultColors[0],
        event: event.value.id
      },
      existingArea ?? {},
      {
        feature_id: feature.id,
        geometry: feature.geometry
      }
    )
    if (existingArea) {
      eventAreas.value = eventAreas.value.map((area) => {
        if (area.feature_id === updatedArea.feature_id) {
          return updatedArea as EventAreaDto
        } else {
          return area
        }
      })
      await updateArea(updatedArea)
    } else {
      eventAreas.value.push(updatedArea as EventAreaDto)
      await updateArea(updatedArea)
    }
  }
}
function handleDeletedFeatures(event: any) {
  const deletedFeatureIds = event.features.map(({ id }: { id: string }) => id)
  for (const featureId of deletedFeatureIds) {
    void deleteAreaByFeatureId(featureId)
  }
}
</script>

<template>
  <DrawControl
    ref="draw"
    :features="features"
    :controls="drawControls"
    :styles="routePlannerStyles"
    :display-controls-default="false"
    @update:features="() => {}"
    @draw:create="handleCreatedFeatures"
    @draw:update="handleCreatedFeatures"
    @draw:delete="handleDeletedFeatures"
  />
  <template v-if="zoomLevel > 16">
    <AddressMarkerLayer :addresses="addresses" />
  </template>
  <PosterMarkerLayer :posters="posters" :editable="false" :opacity="0.5" />
  <Marker
    v-if="event.location"
    v-model:location="event.location"
    :draggable="true"
  />
</template>

<style lang="scss">
.mapbox-gl-draw_ctrl-draw-btn {
  display: none !important;
}
</style>
