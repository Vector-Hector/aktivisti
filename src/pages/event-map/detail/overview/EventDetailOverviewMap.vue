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
import { Feature } from 'geojson'
import FeatureLayer from 'src/mapbox/AreaFeatureLayer'
import Marker from 'src/mapbox/Marker.vue'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'
import InjectMapMixin from 'src/pages/event-detail/InjectMapMixin'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'
import { userStore } from 'src/store/UserStore'

export default defineComponent({
  name: 'EventDetailOverviewMap',
  components: {
    FeatureLayer,
    Marker
  },
  mixins: [InjectMapMixin, EventDetailMixin],
  computed: {
    zoomBox(): BBox2d | null {
      const locationFeatures = [...this.areaFeatures]
      if (this?.event?.location) {
        locationFeatures.push(circle([this.event.location.lng, this.event.location.lat], 0.2))
      }
      return locationFeatures.length > 0 ? bbox({
        type: 'FeatureCollection',
        features: [...this.areaFeatures, ...locationFeatures]
      }) as BBox2d : userStore.getState().bbox
    }
  },
  mounted() {
    this.map?.fitBounds(this.zoomBox as BBox2d, {animate: false})
  }
})

</script>

<style lang="scss" scoped>


</style>
