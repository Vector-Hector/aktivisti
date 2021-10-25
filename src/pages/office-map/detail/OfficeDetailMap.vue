<template>
  <OfficeMarker
    v-if="office?.location"
    :location="office.location" />
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import OfficeMarker from 'components/OfficeMarker.vue'
import OfficeDetailMixin from 'pages/office-map/detail/OfficeDetailMixin'
import InjectMapMixin from 'pages/event-detail/InjectMapMixin'
import { bbox, circle } from '@turf/turf'
import { BBox2d } from '@turf/helpers/dist/js/lib/geojson'

export default defineComponent({
  name: 'OfficeDetailMap',
  components: {OfficeMarker},
  mixins: [InjectMapMixin, OfficeDetailMixin],
  mounted() {
    const minShownAreaAroundLocation = bbox(circle([this.office!.location.lng, this.office!.location.lat], 0.2)) as BBox2d
    this.map?.fitBounds(minShownAreaAroundLocation)
  }
})
</script>
