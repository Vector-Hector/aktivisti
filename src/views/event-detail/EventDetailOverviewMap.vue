<template>
  <Marker
    :location="event.location.center"
  />
  <FeatureLayer
    :features="areaFeatures"
  />
</template>

<script lang="ts">

import { defineComponent, PropType } from 'vue'
import { EventDto } from '@/api/model/EventDto'
import { EventAreaDto } from '@/api/model/EventAreaDto'
import { Feature } from 'geojson'
import FeatureLayer from '@/lib/mapbox/AreaFeatureLayer.vue'
import Marker from '@/lib/mapbox/Marker.vue'
import { bbox, circle } from '@turf/turf'
import { BBox2d, BBox } from '@turf/helpers/dist/js/lib/geojson'
import InjectMapMixin from '@/views/event-detail/InjectMapMixin'

export default defineComponent({
  name: 'EventAreaOverviewMap',
  components: {
    FeatureLayer,
    Marker
  },
  mixins: [InjectMapMixin],
  props: {
    event: {
      type: Object as PropType<EventDto>,
      required: true
    },
    eventAreas: {
      type: Object as PropType<EventAreaDto[]>,
      required: true
    }
  },
  computed: {
    zoomBox(): BBox {
      const meetingPoint = circle([this.event!.location.center.lng, this.event!.location.center.lat], 0.2)
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
    this.map?.fitBounds(this.zoomBox as BBox2d, { animate: false })
  }
})

</script>

<style lang="scss" scoped>
</style>
