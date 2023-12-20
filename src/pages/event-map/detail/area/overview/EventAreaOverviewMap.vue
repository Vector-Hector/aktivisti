<template>
  <AreaFeatureLayer :features="[currentAreaFeature]" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AreaFeatureLayer from 'src/map/AreaFeatureLayer'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { bbox } from '@turf/turf'
import { useInjectMapMixin } from 'pages/event-detail/InjectMapMixin'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventAreaOverviewMap',
  components: { AreaFeatureLayer },
  setup() {
    const { currentAreaFeature } = useEventDetailStore()
    const { map } = useInjectMapMixin()
    return { currentAreaFeature, map }
  },
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
