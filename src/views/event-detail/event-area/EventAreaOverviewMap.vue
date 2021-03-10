<template>
  <FeatureLayer
    :features="[feature]"
  />
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import FeatureLayer from '@/lib/mapbox/AreaFeatureLayer.vue'
import EventAreaMixin from '@/views/event-detail/event-area/EventAreaMixin'
import InjectMapMixin from '@/views/event-detail/InjectMapMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

export default defineComponent({
  name: 'EventAreaOverviewMap',
  components: {FeatureLayer},
  mixins: [EventAreaMixin, InjectMapMixin],
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  }
})

</script>

<style lang="scss" scoped>
</style>
