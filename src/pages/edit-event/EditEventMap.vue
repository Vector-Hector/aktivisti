<template>
  <Map
    ref="map"
    :bounding-box="bbox"
  >
    <router-view
      v-model:event="localEvent"
      :campaigns="campaigns"
    />
  </Map>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Map from 'src/mapbox/Map.vue'
import EditEventMixin from 'src/pages/edit-event/EditEventMixin'
import { point, buffer, bbox } from '@turf/turf'
import { userStore } from 'src/store/UserStore'
import { BBox } from '@turf/helpers/dist/js/lib/geojson'

export default defineComponent({
  name: 'EditEventMap',
  components: {
    Map
  },
  mixins: [EditEventMixin],
  data() {
    return {
      bbox: userStore.getState().bbox ?? undefined as BBox | undefined
    }
  },
  created() {
    if (this.event.location){
      const { lng, lat } = this.event.location
      this.bbox = bbox(buffer(point([lng, lat]), 3, {units: 'kilometers'}))
    }
  },
})
</script>

<style lang="scss" scoped>
.edit-map {
  flex: 1;
}
</style>
