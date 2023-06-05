<template>
  <AreaFeatureLayer :features="[currentAreaFeature]" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox } from '@turf/turf'
import EventDetailStoreMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import InjectMapMixin from 'pages/event-detail/InjectMapMixin'

export default defineComponent({
  name: 'EventAreaOverviewMap',
  components: { AreaFeatureLayer },
  mixins: [EventDetailStoreMixin, InjectMapMixin],
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  },
  computed: {
    bbox(): BBox2d | undefined {
      if (!this.currentAreaFeature) return
      return bbox(this.currentAreaFeature) as BBox2d
    }
  }
})
</script>

<style lang="scss" scoped></style>
