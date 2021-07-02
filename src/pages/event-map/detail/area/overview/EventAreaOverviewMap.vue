<template>
  <FeatureLayer
    :features="[feature]"
  />
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { Feature } from 'geojson'
import { bbox } from '@turf/turf'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import InjectMapMixin from 'pages/event-detail/InjectMapMixin'

export default defineComponent({
  name: 'EventAreaOverviewMap',
  components: {FeatureLayer},
  mixins: [EventDetailStoreMixin, InjectMapMixin],
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  },
  computed: {
    feature(): Feature | undefined {
      if (!this.eventArea) return
      return {
        type: 'Feature',
        geometry: this.eventArea.geometry,
        properties: {
          color: this.eventArea.color
        }
      }
    },
    bbox(): BBox2d | undefined {
      if (!this.feature) return
      return bbox(this.feature) as BBox2d
    }
  }
})

</script>

<style lang="scss" scoped>

</style>
