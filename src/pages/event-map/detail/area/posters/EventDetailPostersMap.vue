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
import { useEventDetailPosterMixin } from 'pages/event-map/detail/area/posters/EventDetailPosterMixin'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailPostersMap',
  components: { AreaFeatureLayer, PosterMarkerLayer },
  setup() {
    const { currentAreaFeature, activePosterIndex, postersInArea } =
      useEventDetailStore()
    const { selectPoster } = useEventDetailPosterMixin()
    return {
      currentAreaFeature,
      activePosterIndex,
      postersInArea,
      selectPoster
    }
  }
})
</script>
