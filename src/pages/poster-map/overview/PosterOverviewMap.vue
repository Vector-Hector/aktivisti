<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserStore } from 'src/stores/user'
import Geocoder from 'src/map/Geocoder.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bboxPolygon } from '@turf/turf'
import useOverviewMixin from 'src/utils/useOverviewMixin'
import { PosterDto } from 'src/api/model/PosterDto'
import { PosterFilterParams } from 'src/api/params/PosterFilterParams'
import { posterOverviewStore } from 'src/store/PosterOverviewStore'
import { apiClient } from 'src/api/ApiClient'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer.vue'
import { Popup } from 'maplibre-gl'
import PosterPopup from 'src/map/popup/layerPopups/PosterPopup.vue'
import { useMap } from 'src/map/MapUtils'

const posterPopup = ref<InstanceType<typeof PosterPopup> | null>(null)

const map = useMap()
const userStore = useUserStore()
const bounds = ref(userStore.bbox)
const popup = ref<Popup | null>(null)
const updateBounds = () => {
  bounds.value = map.value?.getBounds().toArray().flat() as BBox2d
}
map.value.on('zoomend', updateBounds)
map.value.on('moveend', updateBounds)
onUnmounted(() => {
  map.value.off('zoomend', updateBounds)
  map.value.off('moveend', updateBounds)
  popup?.value?.remove()
})
updateBounds()
const { items: posters, updateFilterParams } = useOverviewMixin<
  PosterDto,
  PosterFilterParams
>(posterOverviewStore, apiClient.posters)

async function updateWithinFilter(polygon: BBox2d) {
  await updateFilterParams({
    within: bboxPolygon(polygon).geometry
  })
}
function handlePosterClick(poster: PosterDto) {
  posterPopup.value?.showPopup(poster)
}

onMounted(async () => {
  await updateWithinFilter(bounds.value as BBox2d)
})

watch(bounds, async (newBound) => {
  await updateWithinFilter(newBound)
})
</script>

<template>
  <Geocoder :collapsed="true" position="top-left" :countries="['de']" />
  <PosterPopup ref="posterPopup" />
  <PosterMarkerLayer :posters="posters" @posterClick="handlePosterClick" />
</template>
