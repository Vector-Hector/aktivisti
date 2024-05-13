<script setup lang="ts">
import PosterMarkerLayer from 'src/map/PosterMarkerLayer.vue'
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer.vue'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

const { currentAreaFeature, activePosterIndex, postersInArea } =
  useEventDetailStore()
const { selectPoster } = useEventDetailPosterMixin()
</script>
<template>
  <AreaFeatureLayer
    v-if="currentAreaFeature"
    :features="[currentAreaFeature]"
  />
  <PosterMarkerLayer
    :posters="postersInArea"
    :editable="false"
    :active-poster-index="activePosterIndex"
    @poster-click="(poster) => selectPoster(poster.id, true)"
  />
  <router-view name="map" />
</template>
