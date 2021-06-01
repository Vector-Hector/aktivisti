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
import Map from '@/lib/mapbox/Map.vue'
import EditEventMixin from '@/views/edit-event/EditEventMixin'
import { point, buffer, bbox } from '@turf/turf'
import { userStore } from '@/store/UserStore'

export default defineComponent({
  name: 'EditEventMap',
  components: {
    Map
  },
  mixins: [EditEventMixin],
  data() {
    return {
      bbox:
        this.event.location ? bbox(buffer(point([this.event.location?.lng, this.event.location?.lat]), 3, {units:'kilometers'}))
          : (userStore.getState().bbox ?? undefined)
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
