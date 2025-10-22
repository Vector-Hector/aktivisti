<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { uuidv4 } from 'src/utils/uuid'
import { Feature } from 'geojson'
import { getColorFromPropertiesWithDefault } from 'pages/edit-event/geometry/route-planner.styles'
import { GeoJSONSource } from 'maplibre-gl'
import { useMap } from 'src/map/MapUtils'
import { loadImageIfNonExistent } from 'src/utils/map'

const IS_COMPLETED_COLOR = '#000'

interface Props {
  features: Feature[]
}
const props = defineProps<Props>()

const uuid = uuidv4()
const map = useMap()

const layers: string[] = []
onMounted(async () => {
  await loadImageIfNonExistent(
    map.value,
    'is-completed-icon',
    '/static/ionicons/checkmark-circle-outline.png'
  )

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
      // @ts-ignore
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
    filter: ['==', ['get', 'is_completed'], true],
    paint: {
      'fill-pattern': [
        'case',
        ['==', ['get', 'is_completed'], true],
        'is-completed-icon',
        ''
      ],
      'fill-opacity': ['case', ['==', ['get', 'is_completed'], true], 0.25, 0.5]
    }
  })
})

onUnmounted(() => {
  layers.forEach((layerId) => {
    map?.value?.removeLayer(layerId)
  })
})
</script>
<template><span></span></template>
