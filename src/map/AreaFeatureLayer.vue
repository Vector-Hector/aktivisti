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
    )
  ])

  map?.value.addSource(uuid, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  watch(
    () => props.features,
    (newValue) => {
      ;(map.value?.getSource(uuid) as GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: newValue
      })
    },
    { immediate: true }
  )
  const fillLayer = `${uuid}-fill`
  const outlineLayer = `${uuid}-outline`
  const iconLayer = `${uuid}-icon`

  layers.push(fillLayer, outlineLayer, iconLayer)
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
