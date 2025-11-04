<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import MapboxDraw, { IMapboxDrawControls } from '@mapbox/mapbox-gl-draw'
import { Feature } from 'geojson'
import { difference, isEqual } from 'lodash-es'
import { useMap } from 'src/map/MapUtils'

type ForwardedEvents =
  | 'draw:create'
  | 'draw:update'
  | 'draw:delete'
  | 'draw:selectionchange'

interface Props {
  controls?: IMapboxDrawControls
  displayControlsDefault?: boolean
  features?: Feature[]
  styles?: any[] | undefined
}
const props = withDefaults(defineProps<Props>(), {
  displayControlsDefault: true,
  features: () => [],
  styles: undefined
})

interface Emits {
  (e: 'update:features', event: any): void
  (e: 'draw:create', event: any): void
  (e: 'draw:update', event: any): void
  (e: 'draw:delete', event: any): void
  (e: 'draw:selectionchange', event: any): void
}
const emit = defineEmits<Emits>()

const map = useMap()
const drawControl = new MapboxDraw({
  userProperties: true,
  controls: props.controls,
  displayControlsDefault: props.displayControlsDefault,
  styles: props.styles ?? []
})

map.value.addControl(drawControl, 'top-right')

watch(
  () => props.features,
  (newFeatures) => {
    for (const feature of newFeatures) {
      const existentFeature = drawControl.get(feature.id as string)
      if (!isEqual(feature, existentFeature)) {
        drawControl.add(feature)
        // invoke this function to indicate feature change
        drawControl.setFeatureProperty(feature.id as string, 'changed', true)
      }
    }
    // determine deleted features
    const idsToDelete = difference(
      drawControl.getAll().features.map(({ id }) => id),
      newFeatures.map(({ id }) => id)
    )
    drawControl.delete(idsToDelete as string[])
  },
  { immediate: true }
)

const forwardEventAndUpdateFeatures = (
  eventName: ForwardedEvents,
  event: any
) => {
  emit(eventName, event)
  emit('update:features', drawControl.getAll().features)
}
const createListener = (event: any) =>
  forwardEventAndUpdateFeatures('draw:create', event)
const deleteListener = (event: any) =>
  forwardEventAndUpdateFeatures('draw:delete', event)
const updateListener = (event: any) =>
  forwardEventAndUpdateFeatures('draw:update', event)
const selectionChangeListener = (event: any) =>
  forwardEventAndUpdateFeatures('draw:selectionchange', event)
map.value.on('draw.create', createListener)
map.value.on('draw.delete', deleteListener)
map.value.on('draw.update', updateListener)
map.value.on('draw.selectionchange', selectionChangeListener)

onUnmounted(() => {
  map.value
    .off('draw.create', createListener)
    .off('draw.delete', deleteListener)
    .off('draw.update', updateListener)
    .off('draw.selectionchange', selectionChangeListener)
  map.value?.removeControl(drawControl)
})

function changeMode(mode: string) {
  drawControl.changeMode(mode)
}

defineExpose({ changeMode })
</script>
<template><span></span></template>
<style lang="scss">
// Since update of maplibre to version 3, it seems like the css isn't set correctly
// and the cursor isn't changing. The css class `mapboxgl-` have been removed and developers
// should use maplibregl- instead, to mitigate that we overwrite the CSS:
.maplibregl-map.mouse-pointer
  .maplibregl-canvas-container.maplibregl-interactive {
  cursor: pointer;
}
.maplibregl-map.mouse-move .maplibregl-canvas-container.maplibregl-interactive {
  cursor: move;
}
.maplibregl-map.mouse-add .maplibregl-canvas-container.maplibregl-interactive {
  cursor: crosshair;
}
.maplibregl-map.mouse-move.mode-direct_select
  .maplibregl-canvas-container.maplibregl-interactive {
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}
.maplibregl-map.mode-direct_select.feature-vertex.mouse-move
  .maplibregl-canvas-container.maplibregl-interactive {
  cursor: move;
}
.maplibregl-map.mode-direct_select.feature-midpoint.mouse-pointer
  .maplibregl-canvas-container.maplibregl-interactive {
  cursor: cell;
}
.maplibregl-map.mode-direct_select.feature-feature.mouse-move
  .maplibregl-canvas-container.maplibregl-interactive {
  cursor: move;
}
.maplibregl-map.mode-static.mouse-pointer
  .maplibregl-canvas-container.maplibregl-interactive {
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}
</style>
