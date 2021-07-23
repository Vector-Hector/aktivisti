<template>
  <AreaFeatureLayer
    :features="areaFeatures"
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
import PosterMarkerLayer from 'src/mapbox/PosterMarkerLayer'
import EventDetailPosterMixin from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import AreaFeatureLayer from 'src/mapbox/AreaFeatureLayer'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailPostersMap',
  components: {AreaFeatureLayer, PosterMarkerLayer},
  mixins: [EventDetailPosterMixin, EventDetailMixin]
})
</script>
