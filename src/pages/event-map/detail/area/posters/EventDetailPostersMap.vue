<template>
  <AreaFeatureLayer
    v-if="currentAreaFeature"
    :features="[currentAreaFeature]"
  />
  <PosterMarkerLayer
    :posters="postersInArea"
    :editable="false"
    :active-poster-index="activePosterIndex"
    @poster-click="selectPoster($event, true)"
  />
  <router-view name="map" />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import PosterMarkerLayer from 'src/map/PosterMarkerLayer'
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'

export default defineComponent({
  name: 'EventDetailPostersMap',
  components: { AreaFeatureLayer, PosterMarkerLayer },
  mixins: [EventDetailPosterMixin]
})
</script>
