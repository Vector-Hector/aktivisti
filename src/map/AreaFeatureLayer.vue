<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { uuidv4 } from 'src/utils/uuid'
import { Feature } from 'geojson'
import { getColorFromPropertiesWithDefault } from 'pages/edit-event/geometry/route-planner.styles'
import { GeoJSONSource } from 'maplibre-gl'
import { useMap } from 'src/map/Map.vue'

interface Props {
  features: Feature[]
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update:location'): void
}
const emit = defineEmits<Emits>()

const uuid = uuidv4()
const map = useMap()

const layers: string[] = []
onMounted(() => {
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

  layers.push(fillLayer, outlineLayer)
  map?.value.addLayer({
    id: `${uuid}-fill`,
    type: 'fill',
    source: uuid,
    paint: {
      // @ts-ignore
      'fill-color': getColorFromPropertiesWithDefault('#000', 'color'),
      'fill-opacity': 0.1
    }
  })
  map?.value.addLayer({
    id: `${uuid}-outline`,
    type: 'line',
    source: uuid,
    paint: {
      // @ts-ignore
      'line-color': getColorFromPropertiesWithDefault('#000', 'color')
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
