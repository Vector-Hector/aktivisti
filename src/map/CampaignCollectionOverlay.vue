<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { CampaignGeometriesDto } from 'src/api/model/CampaignGeometriesDto'
import { Feature, FeatureCollection, Geometry } from 'geojson'
import { apiClient } from 'src/api/ApiClient'
import { CampaignGeometryCollectionsDto } from 'src/api/model/CampaignGeometryCollectionsDto'
import { uuidv4 } from 'src/utils/uuid'
import { bbox } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import GeometryPopup from 'src/map/popup/layerPopups/GeometryPopup.vue'
import { useMap } from 'src/map/MapUtils'

interface Props {
  /**
   * List of Campaign Collection IDs
   */
  collection: CampaignGeometryCollectionsDto
  /**
   * When set to true, moving over a geometry triggers a highlight of the drawn geometry.
   */
  hover?: boolean
  /**
   * When set to true, the underlying map will zoom to the features.
   */
  fitMap?: boolean
}

interface Emits {
  (
    e: 'geometryClick',
    geometryId: number,
    geometry: Geometry,
    metadata: any
  ): void
  (e: 'onLoadingFinished'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const map = useMap()
const geometryPopup = ref<InstanceType<typeof GeometryPopup> | null>(null)
let overlayIds: string[] = []
let hoveredGeometry = {
  layerId: null as string | null,
  sourceId: null as string | null
}

const overlayID = ref<string | null>(null)

onMounted(async () => {
  await initializeOverlay(props.collection)
})

watch(
  () => props.collection,
  async (newCollection) => {
    cleanUp()
    await initializeOverlay(newCollection)
  }
)

onUnmounted(() => {
  cleanUp()
})

async function initializeOverlay(collection: CampaignGeometryCollectionsDto) {
  const geometries = (
    await apiClient.campaignGeometries.list({
      geometry_collection: collection.id
    })
  ).payload.data
  overlayID.value = uuidv4()
  const featureCollection = composeFeatureCollection(geometries)
  drawFeatureCollection(overlayID.value, featureCollection, collection.color)
  addEventHandlers(overlayID.value)
  emit('onLoadingFinished')
  if (props.fitMap) {
    fitMap(featureCollection)
  }
}

function cleanUp() {
  if (overlayID.value) {
    removeCollectionOverlay(overlayID.value)
    removeEventHandlers(overlayID.value)
  }
}

/**
 * Create a geoJSON Feature collection from Campaign Geometries
 * @param geometries - List of Campaign Geometries
 */
function composeFeatureCollection(
  geometries: CampaignGeometriesDto[]
): FeatureCollection {
  const features: Feature[] = geometries.map((geo) => ({
    type: 'Feature',
    id: geo.id,
    geometry: geo.geometry,
    properties: {
      id: geo.id,
      raw_metadata: { ...geo.metadata }
    }
  }))
  return {
    type: 'FeatureCollection',
    features: features
  }
}

/**
 * Draw multiple geometries with color on the map.
 * The geometry can be identified, by the self-selected identifier.
 * @param id - A unique self-selected identifier for the geometry
 * @param featureCollection - A geoJSON feature Collection
 * @param color - Base color of the Layer
 */
function drawFeatureCollection(
  id: string,
  featureCollection: FeatureCollection,
  color: string
): void {
  const sourceId = `${id}-source`
  const fillLayerId = `${id}-fill`
  const outlineLayerId = `${id}-outline`

  map.value.addSource(sourceId, {
    type: 'geojson',
    data: featureCollection
  })

  map.value.addLayer({
    id: fillLayerId,
    type: 'fill',
    source: sourceId,
    paint: {
      'fill-color': color,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.5,
        0.0
      ]
    }
  })
  map.value.addLayer({
    id: outlineLayerId,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': color,
      'line-dasharray': [5, 5]
    }
  })
}

/**
 * Add event handlers to an overlay.
 * @param overlayId - Overlay ID (see {@link drawFeatureCollection})
 */
function addEventHandlers(overlayId: string): void {
  const fillLayerId = `${overlayId}-fill`
  const outlineLayerId = `${overlayId}-outline`
  map.value.on('click', fillLayerId, handleGeometryClick)
  map.value.on('click', outlineLayerId, handleGeometryClick)

  if (props.hover) {
    map.value.on('mousemove', fillLayerId, handleGeometryMouseOver)
    map.value.on('mouseleave', fillLayerId, handleGeometryLeave)
  }
}

/**
 * Remove Geometry Collection Overlay from map.
 * @param overlayId - Overlay ID (see {@link drawFeatureCollection})
 */
function removeCollectionOverlay(overlayId: string): void {
  removeEventHandlers(overlayId)
  removeGeometries(overlayId)

  overlayIds = overlayIds.filter((id) => id !== overlayId)
}

/**
 * Remove event handlers from an overlay.
 * @param overlayId - Overlay ID (see {@link drawFeatureCollection})
 */
function removeEventHandlers(overlayId: string): void {
  const fillLayerId = `${overlayId}-fill`
  const outlineLayerId = `${overlayId}-outline`
  map.value
    .off('click', fillLayerId, handleGeometryClick)
    .off('click', outlineLayerId, handleGeometryClick)

  if (props.hover) {
    map.value
      .off('mousemove', fillLayerId, handleGeometryMouseOver)
      .off('mouseleave', fillLayerId, handleGeometryLeave)
  }
}

/**
 * Removes drawn geometry from map.
 * @param overlayId - Overlay ID (see {@link drawFeatureCollection})
 */
function removeGeometries(overlayId: string): void {
  const sourceId = `${overlayId}-source`
  const fillLayerId = `${overlayId}-fill`
  const outlineLayerId = `${overlayId}-outline`
  map.value.removeLayer(fillLayerId)
  map.value.removeLayer(outlineLayerId)
  map.value.removeSource(sourceId)
}

/**
 * Handle the click on a drawn Geometry.
 * @param e - Click Event
 * @see {@link drawFeatureCollection}
 */
function handleGeometryClick(e: any): void {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { properties, geometry } = e.features?.[0]
  const geometryId = properties?.id
  const metadata = JSON.parse(properties?.raw_metadata)
  if (geometryId) {
    emit('geometryClick', geometryId, geometry, metadata)
  }
}

/**
 * Handle for dealing with hovering.
 * @param e - Event triggered by mouseover
 * @see {@link drawFeatureCollection}
 * @see {@link hoveredGeometry}
 */
function handleGeometryMouseOver(e: any): void {
  if (e.features?.length > 0) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { properties, id: layerId, source: sourceId } = e.features?.[0]
    const metadata = JSON.parse(properties?.raw_metadata)
    geometryPopup.value?.remove()
    geometryPopup.value?.showPopup(metadata, e.lngLat)
    if (hoveredGeometry.sourceId !== null && hoveredGeometry.layerId !== null) {
      map.value.setFeatureState(
        { source: hoveredGeometry.sourceId, id: hoveredGeometry.layerId },
        { hover: false }
      )
    }
    hoveredGeometry = {
      layerId: layerId,
      sourceId: sourceId
    }
    map.value.setFeatureState(
      { source: hoveredGeometry.sourceId!, id: hoveredGeometry.layerId! },
      { hover: true }
    )
  }
}

/**
 * Handle for dealing with hovering.
 * @see {@link drawFeatureCollection}
 * @see {@link hoveredGeometry}
 */
function handleGeometryLeave(): void {
  if (hoveredGeometry.layerId !== null && hoveredGeometry.sourceId !== null) {
    map.value.setFeatureState(
      { source: hoveredGeometry.sourceId, id: hoveredGeometry.layerId },
      { hover: false }
    )
  }
  hoveredGeometry = {
    layerId: null,
    sourceId: null
  }
  geometryPopup.value?.remove()
}

/**
 * Fit the underlying map, so that all areas are visible.
 */
function fitMap(featureCollection: FeatureCollection): void {
  map.value.fitBounds(bbox(featureCollection) as BBox2d)
}
</script>

<template>
  <span />
  <GeometryPopup ref="geometryPopup" />
</template>
