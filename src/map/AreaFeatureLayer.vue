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

interface Props {
  features: Feature[]
}

interface Emits {
  (e: 'onEventAreaClick', eventAreaId: number, lngLat: LngLat): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const uuid = uuidv4()
const map = useMap()

const labelSourceId = `${uuid}-labels`

const layers: string[] = []

function handleEventAreaClick(
  e: MapMouseEvent & {
    features?: MapGeoJSONFeature[]
  } & object
) {
  const eventAreaId = e.features[0].properties.area_id
  emit('onEventAreaClick', eventAreaId, e.lngLat)
}

function addEventHandlers(layerId: string) {
  const fillLayer = `${layerId}-fill`
  map.value.on('click', fillLayer, handleEventAreaClick)
}

function removeEventHandlers(layerId: string) {
  const fillLayer = `${layerId}-fill`
  map.value.off('click', fillLayer, handleEventAreaClick)
}

onMounted(async () => {
  await Promise.all([
    loadImageIfNonExistent(
      map.value,
      'is-completed-icon',
      '/static/ionicons/checkmark-circle-outline.png'
    ),
    loadImageIfNonExistent(
      map.value,
      'has-no-assignee-icon',
      '/static/ionicons/warning-outline.png'
    ),
    loadImageIfNonExistent(
      map.value,
      'label-background',
      '/static/icons/background.png'
    )
  ])

  map?.value.addSource(uuid, {
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
    const baseSource = map.value?.getSource(uuid) as GeoJSONSource
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
  const fillLayer = `${uuid}-fill`
  const outlineLayer = `${uuid}-outline`
  const iconLayer = `${uuid}-icon`
  const labelLayer = `${uuid}-label`

  layers.push(fillLayer, outlineLayer, iconLayer, labelLayer)

  map?.value.addLayer({
    id: `${uuid}-fill`,
    type: 'fill',
    source: uuid,
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
    id: `${uuid}-outline`,
    type: 'line',
    source: uuid,
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
    id: `${uuid}-icon`,
    type: 'fill',
    source: uuid,
    filter: [
      'any',
      ['==', ['get', 'is_completed'], true],
      ['!=', ['get', 'has_assignee'], true]
    ],
    paint: {
      'fill-pattern': [
        'case',
        ['==', ['get', 'is_completed'], true],
        'is-completed-icon',
        ['!=', ['get', 'has_assignee'], true],
        'has-no-assignee-icon',
        ''
      ],
      'fill-opacity': ['case', ['==', ['get', 'is_completed'], true], 0.25, 0.5]
    }
  })
  map.value?.addLayer({
    id: labelLayer,
    type: 'symbol',
    source: labelSourceId,
    layout: {
      'text-field': ['get', 'name'],
      'text-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        0.01,
        10,
        8,
        15,
        12,
        20,
        14
      ],
      'text-anchor': 'center',
      'text-max-width': 12,
      'icon-image': 'label-background',
      'icon-text-fit': 'both',
      'icon-text-fit-padding': [2, 2, 2, 2],
      'text-allow-overlap': true
    },
    paint: {
      'text-color': '#000',
      'text-halo-color': 'white',
      'text-halo-width': 1,
      'icon-opacity': 0.5
    }
  })
  addEventHandlers(uuid)
})

onUnmounted(() => {
  layers.forEach((layerId) => {
    map?.value?.removeLayer(layerId)
  })
  removeEventHandlers(uuid)
})
</script>
<template><span></span></template>
