<script lang="ts">
import { defineComponent } from 'vue'
import FeatureLayer from 'src/map/AreaFeatureLayer'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { useInjectMapMixin } from 'src/pages/event-detail/InjectMapMixin'
import EventMarker from 'components/EventMarker.vue'
import { cloneDeep, isEqual } from 'lodash-es'
import { useEventDetailStore } from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailOverviewMap',
  components: {
    EventMarker,
    FeatureLayer
  },
  setup() {
    const { event, areaFeatures, zoomBox } = useEventDetailStore()
    const { map } = useInjectMapMixin()
    return { event, areaFeatures, zoomBox, map }
  },
  mounted() {
    this.map?.fitBounds(this.zoomBox as BBox2d, { animate: false })
  },
  computed: {
    zoomBoxCopy(): BBox2d | null {
      return cloneDeep(this.zoomBox)
    }
  },
  watch: {
    zoomBoxCopy: {
      handler(newValue, oldValue) {
        if (newValue !== null && !isEqual(newValue, oldValue)) {
          this.map?.fitBounds(newValue as BBox2d)
        }
      },
      deep: true
    }
  }
})
</script>

<template>
  <EventMarker v-if="event?.location" :event="event" />
  <FeatureLayer :features="areaFeatures" />
</template>

<style lang="scss" scoped></style>
