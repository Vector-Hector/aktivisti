<template>
  <Marker
    v-if="event?.location"
    :location="event.location"
  />
  <FeatureLayer
    :features="areaFeatures"
  />
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer'
import Marker from 'src/mapbox/Marker.vue'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import InjectMapMixin from 'src/pages/event-detail/InjectMapMixin'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailOverviewMap',
  components: {
    FeatureLayer,
    Marker
  },
  mixins: [InjectMapMixin, EventDetailMixin],
  mounted() {
    this.map?.fitBounds(this.zoomBox as BBox2d, {animate: false})
  }
})

</script>

<style lang="scss" scoped>


</style>
