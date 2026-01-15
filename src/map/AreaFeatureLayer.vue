<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { uuidv4 } from 'src/utils/uuid'
import { Feature } from 'geojson'
import { getColorFromPropertiesWithDefault } from 'pages/edit-event/geometry/route-planner.styles'
import {
  GeoJSONSource,
  LngLat,
  MapGeoJSONFeature,
  MapMouseEvent
} from 'maplibre-gl'
import { useMap } from 'src/map/MapUtils'
import { loadImageIfNonExistent } from 'src/utils/map'
import { centroid } from '@turf/turf'

const IS_COMPLETED_COLOR = '#000'
const LABEL_MIN_ZOOM = 14

interface Props {
  features: Feature[]
}

interface Emits {
  (e: 'onEventAreaClick', eventAreaId: number, lngLat: LngLat): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const areaSourceId = uuidv4()
const labelSourceId = uuidv4()

const map = useMap()

const layers: string[] = []

function handleEventAreaClick(
  e: MapMouseEvent & {
    features?: MapGeoJSONFeature[]
  } & object
) {
  const eventAreaId = e.features[0].properties.area_id
  emit('onEventAreaClick', eventAreaId, e.lngLat)
}

function handleMouseEnterArea() {
  map.value.getCanvas().style.cursor = 'pointer'
}

function handleMouseLeaveArea() {
  map.value.getCanvas().style.cursor = ''
}

function addEventHandlers(layerId: string) {
  const fillLayer = `${layerId}-fill`
  map.value.on('click', fillLayer, handleEventAreaClick)
  map.value.on('mouseenter', fillLayer, handleMouseEnterArea)
  map.value.on('mouseleave', fillLayer, handleMouseLeaveArea)
}

function removeEventHandlers(layerId: string) {
  const fillLayer = `${layerId}-fill`
  map.value.off('click', fillLayer, handleEventAreaClick)
  map.value.off('mouseenter', fillLayer, handleMouseEnterArea)
  map.value.off('mouseleave', fillLayer, handleMouseLeaveArea)
}

onMounted(async () => {
  await Promise.all([
    loadImageIfNonExistent(
      map.value,
      'is-completed-icon',
      '/static/ionicons/checkmark-sharp.png'
    ),
    loadImageIfNonExistent(
      map.value,
      'has-no-assignee-icon',
      '/static/ionicons/flag.png'
    ),
    loadImageIfNonExistent(
      map.value,
      'label-background',
      '/static/icons/background.png'
    )
  ])

  map?.value.addSource(areaSourceId, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })
  map?.value.addSource(labelSourceId, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  const updateSources = (features: Feature[]) => {
    const baseSource = map.value?.getSource(areaSourceId) as GeoJSONSource
    baseSource?.setData({
      type: 'FeatureCollection',
      features
    })

    const centroidFeatures = features.map((f) => {
      const c = centroid(f)
      c.properties = f.properties || {}
      return c
    })

    const labelSource = map.value?.getSource(labelSourceId) as GeoJSONSource
    labelSource?.setData({
      type: 'FeatureCollection',
      features: centroidFeatures
    })
  }

  watch(
    () => props.features,
    (newValue) => updateSources(newValue),
    { immediate: true }
  )
  const fillLayer = `${areaSourceId}-fill`
  const outlineLayer = `${areaSourceId}-outline`
  const iconCircleLayer = `${labelSourceId}-icon-circle`
  const iconLayer = `${labelSourceId}-icon`
  const nameLayer = `${labelSourceId}-name`

  layers.push(fillLayer, outlineLayer, iconCircleLayer, iconLayer, nameLayer)

  map?.value.addLayer({
    id: fillLayer,
    type: 'fill',
    source: areaSourceId,
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'is_completed'], true],
        IS_COMPLETED_COLOR,
        getColorFromPropertiesWithDefault('#000', 'color')
      ],
      'fill-opacity': 0.1
    }
  })
  map?.value.addLayer({
    id: outlineLayer,
    type: 'line',
    source: areaSourceId,
    paint: {
      // @ts-ignore
      'line-color': [
        'case',
        ['==', ['get', 'is_completed'], true],
        IS_COMPLETED_COLOR,
        getColorFromPropertiesWithDefault('#000', 'color')
      ],
      'line-opacity': ['case', ['==', ['get', 'is_completed'], true], 0.25, 1],
      'line-width': 1
    }
  })
  map.value?.addLayer({
    id: nameLayer,
    type: 'symbol',
    source: labelSourceId,
    minzoom: LABEL_MIN_ZOOM,
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-anchor': 'left',
      'text-offset': [1.1, 0],
      'text-max-width': 12,
      'icon-image': 'label-background',
      'icon-text-fit': 'both',
      'icon-text-fit-padding': [2, 8, 2, 8],
      'icon-allow-overlap': true
    },
    paint: {
      'text-color': '#000',
      'text-halo-color': 'white',
      'text-halo-width': 1,
      'icon-opacity': 0.5
    }
  })
  map.value?.addLayer({
    id: iconCircleLayer,
    type: 'circle',
    source: labelSourceId,
    minzoom: LABEL_MIN_ZOOM,
    filter: [
      'any',
      ['==', ['get', 'is_completed'], true],
      ['!=', ['get', 'has_assignee'], true]
    ],
    paint: {
      'circle-radius': 9,
      'circle-color': '#fff',
      'circle-stroke-color': IS_COMPLETED_COLOR,
      'circle-stroke-width': 1,
      'circle-opacity': 1
    }
  })
  map.value?.addLayer({
    id: iconLayer,
    type: 'symbol',
    source: labelSourceId,
    minzoom: LABEL_MIN_ZOOM,

    layout: {
      'icon-image': [
        'case',
        ['==', ['get', 'is_completed'], true],
        'is-completed-icon',
        ['!=', ['get', 'has_assignee'], true],
        'has-no-assignee-icon',
        ''
      ],
      'icon-allow-overlap': true,
      'icon-size': 0.2
    }
  })

  addEventHandlers(areaSourceId)
})

onUnmounted(() => {
  layers.forEach((layerId) => {
    map?.value?.removeLayer(layerId)
  })
  removeEventHandlers(areaSourceId)
})
</script>
<template><span></span></template>
