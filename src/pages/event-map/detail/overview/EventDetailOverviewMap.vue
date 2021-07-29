<template>
  <EventMarker
    v-if="event?.location"
    :event="event"
  />
  <FeatureLayer
    :features="areaFeatures"
  />
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import InjectMapMixin from 'src/pages/event-detail/InjectMapMixin'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import EventMarker from 'components/EventMarker.vue'
import { cloneDeep, isEqual } from 'lodash-es'

export default defineComponent({
  name: 'EventDetailOverviewMap',
  components: {
    EventMarker,
    FeatureLayer
  },
  mixins: [InjectMapMixin, EventDetailMixin],
  mounted() {
    this.map?.fitBounds(this.zoomBox as BBox2d, {animate: false})
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

<style lang="scss" scoped>


</style>
