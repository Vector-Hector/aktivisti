<template>
  <Marker
    v-if="location"
    :location="markerLocation"
  >
    <template #marker>
      <i class="marker-icon">{{ address.house_number }}</i>
    </template>
  </Marker>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import Marker from '@/lib/mapbox/Marker.vue'
import InjectMapMixin from '@/views/event-detail/InjectMapMixin'
import EventAreaMetricsMixin from '@/views/event-detail/event-area/EventAreaMetricsMixin'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import { LocationDto } from '@/api/model/LocationDto'

export default defineComponent({
  name: 'EventAreaMetricsMap',
  components: {Marker},
  mixins: [EventAreaMetricsMixin, InjectMapMixin],
  computed: {
    markerLocation(): LocationDto | undefined {
      if (!this.location) return
      return {
        lat: this.location.geometry.coordinates[1],
        lng: this.location.geometry.coordinates[0]
      }
    }
  },
  mounted() {
    this.map?.fitBounds(this.bbox as BBox2d)
  }
})

</script>

<style lang="scss" scoped>
.marker-icon {
  border-radius: 999px;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 1.2;
  display: block;
  background: white;
  border: 1px solid red;
}
</style>
