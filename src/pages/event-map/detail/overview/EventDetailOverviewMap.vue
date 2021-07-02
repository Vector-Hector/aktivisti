7<template>
  <Marker
    v-if="event"
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
import { BBox2d, BBox } from '@turf/helpers/dist/js/lib/geojson'
import InjectMapMixin from 'src/pages/event-detail/InjectMapMixin'
import EventDetailMixin from 'pages/event-map/detail/EventDetailStoreMixin'

export default defineComponent({
  name: 'EventDetailOverviewMap',
  components: {
    FeatureLayer,
    Marker
  },
  mixins: [InjectMapMixin, EventDetailMixin],
  computed: {
    zoomBox(): BBox {
      const meetingPoint = circle([this.event.location.lng, this.event.location.lat], 0.2)
      return this.areaFeatures.length > 0 ? bbox({
        type: 'FeatureCollection',
        features: [...this.areaFeatures, meetingPoint]
      }) : bbox(meetingPoint)
    },
    areaFeatures(): Feature[] {
      return this.eventAreas.map((area) => {
        return {
          type: 'Feature',
          id: area.feature_id,
          geometry: area.geometry,
          properties: {
            color: area.color
          }
        }
      })
    }
  },
  mounted() {
    this.map?.fitBounds(this.zoomBox as BBox2d, {animate: false})
  }
})

</script>

<style lang="scss" scoped>


</style>
